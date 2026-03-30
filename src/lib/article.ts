import { fetchWordPressGraphQL, fetchWordPressRest } from './wordpress'
import { getWordPressConfig } from './config'
import type { Article, ElementorInlineScript, ElementorJsPayload, ElementorScriptAsset } from '@/types/wordpress'

const ARTICLE_REVALIDATE_SECONDS = 300
const ELEMENTOR_FETCH_TIMEOUT_MS = 4000

function createTimeoutController(timeoutMs: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId)
  }
}

type ArticleQueryData = Omit<Article, 'content'> & {
  renderedContent?: string | null
  rawContent?: string | null
}

type ArticleNode = ArticleQueryData & {
  optionsArticles?: Article['optionsArticles'] & {
    imagePortait?: {
      node?: {
        guid?: string | null
        srcSet?: string | null
      }
    }
  }
}

interface ArticleResponse {
  postBy: ArticleNode | null
}

interface ArticleByDatabaseIdResponse {
  post: ArticleNode | null
}

interface WordPressMediaSizeResponse {
  source_url?: string
  width?: number
  height?: number
}

interface WordPressMediaResponse {
  id: number
  source_url?: string
  alt_text?: string
  media_details?: {
    width?: number
    height?: number
    sizes?: Record<string, WordPressMediaSizeResponse | undefined>
  }
}

interface VcSingleImageShortcode {
  raw: string
  imageId: number
  imgSize?: string
  alignment?: string
}

const ARTICLE_QUERY_FIELDS = /* GraphQL */ `
  databaseId
  title
  excerpt
  renderedContent: content
  rawContent: content(format: RAW)
  elementorContent
  isBuiltWithElementor
  uri
  slug
  optionsArticles {
    champsLibre
    champsLibrePageAccueil
    imagePortait {
      node {
        guid
        sourceUrl
        srcSet
        altText
      }
    }
    imagePaysage {
      node {
        guid
        srcSet
      }
    }
  }
  featuredImage {
    node {
      guid
      sourceUrl
      srcSet
      altText
    }
  }
  localisations {
    edges {
      node {
        id
        name
        slug
        parent {
          node {
            id
            name
            slug
          }
        }
      }
    }
  }
  categories {
    edges {
      node {
        name
        slug
        parent {
          node {
            name
            slug
          }
        }
      }
    }
  }
`

const ARTICLE_BY_SLUG_QUERY = /* GraphQL */ `
  query GetPostBySlug($slug: String!) {
    postBy(slug: $slug) {
      ${ARTICLE_QUERY_FIELDS}
    }
  }
`

const ARTICLE_BY_DATABASE_ID_QUERY = /* GraphQL */ `
  query GetPostByDatabaseId($id: ID!, $asPreview: Boolean!) {
    post(id: $id, idType: DATABASE_ID, asPreview: $asPreview) {
      ${ARTICLE_QUERY_FIELDS}
    }
  }
`

const VC_SINGLE_IMAGE_REGEX = /\[vc_single_image([^\]]*)\]/gi
const VC_SINGLE_IMAGE_BLOCK_REGEX = /<p>\s*(\[vc_single_image[^\]]*\])\s*<\/p>|(\[vc_single_image[^\]]*\])/gi
const SHORTCODE_ATTRIBUTE_REGEX = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]+))/gi
const VC_TAG_REGEX = /\[(\/?vc_[a-z0-9_]+)\b[^\]]*\]/gi

const SUPPORTED_VC_SHORTCODES = new Set([
  'vc_row',
  'vc_column',
  'vc_column_text',
  'vc_single_image',
  'vc_text_separator'
])

export async function getArticleBySlug(slug: string) {
  const data = await fetchWordPressGraphQL<ArticleResponse>(ARTICLE_BY_SLUG_QUERY, {
    variables: { slug },
    next: { revalidate: ARTICLE_REVALIDATE_SECONDS },
    headers: getWordPressContentAuthHeaders()
  })

  return resolveArticle(data.postBy ?? null)
}

export async function getArticleByDatabaseId(databaseId: number, options?: { asPreview?: boolean }) {
  if (!Number.isInteger(databaseId) || databaseId <= 0) {
    return null
  }

  const asPreview = options?.asPreview ?? false

  const data = await fetchWordPressGraphQL<ArticleByDatabaseIdResponse>(ARTICLE_BY_DATABASE_ID_QUERY, {
    variables: {
      id: String(databaseId),
      asPreview
    },
    ...(asPreview ? { cache: 'no-store' as const } : { next: { revalidate: ARTICLE_REVALIDATE_SECONDS } }),
    headers: getWordPressContentAuthHeaders()
  })

  return resolveArticle(data.post ?? null)
}

async function resolveArticle(article: ArticleNode | null) {
  if (!article) {
    return null
  }

  const hasVcShortcodes =
    contentHasVcShortcodes(article.rawContent) ||
    contentHasVcShortcodes(article.renderedContent) ||
    contentHasVcShortcodes(article.elementorContent)
  const hasClassicEditor =
    article.isBuiltWithElementor === false &&
    !hasVcShortcodes &&
    !contentHasGutenbergBlocks(article.rawContent)
  const enrichedArticle = await enrichArticleInlineImages(article)

  if (!enrichedArticle) {
    return null
  }

  return {
    ...enrichedArticle,
    hasVcShortcodes,
    hasClassicEditor
  }
}

interface ElementorCssRequestOptions {
  postId?: number | null
  preview?: boolean
}

export async function getElementorCssFiles(options: ElementorCssRequestOptions = {}) {
  const params = new URLSearchParams()

  if (Number.isInteger(options.postId) && Number(options.postId) > 0) {
    params.set('post_id', String(options.postId))
  }

  if (options.preview) {
    params.set('preview', 'true')
  }

  const query = params.toString()
  const path = query ? `elementor/v1/css-files?${query}` : 'elementor/v1/css-files'

  try {
    return await fetchWordPressRest<string[]>(path)
  } catch (error) {
    console.warn('Failed to load Elementor CSS file list from REST API', error)
    return []
  }
}

export type ElementorCssAsset = {
  id: string
  content: string
}

export async function getElementorCssBundle(options: ElementorCssRequestOptions = {}): Promise<ElementorCssAsset[]> {
  const files = await getElementorCssFiles(options)
  if (!files.length) {
    return []
  }

  const entries = await Promise.all(
    files.map(async (href) => {
      if (!href) {
        return null
      }
      try {
        const { signal, clear } = createTimeoutController(ELEMENTOR_FETCH_TIMEOUT_MS)
        const response = await fetch(href, { cache: 'force-cache', signal }).finally(() => {
          clear()
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch Elementor CSS: ${response.status}`)
        }
        const content = await response.text()
        return { id: href, content }
      } catch (error) {
        console.warn('Unable to inline Elementor stylesheet', href, error)
        return null
      }
    })
  )

  return entries.filter((entry): entry is ElementorCssAsset => Boolean(entry))
}

export async function getElementorJsAssets(postId?: number | null, uri?: string) {
  const apiAssets = await requestElementorAssetsFromApi(postId)

  if (hasElementorAssets(apiAssets)) {
    return apiAssets
  }

  const fallbackAssets = await scrapeElementorAssetsFromPage(uri)

  if (hasElementorAssets(fallbackAssets)) {
    return fallbackAssets
  }

  return apiAssets
}

async function enrichArticleInlineImages(
  article: (ArticleQueryData & {
    optionsArticles?: Article['optionsArticles']
    featuredImage?: Article['featuredImage']
    localisations?: Article['localisations']
    categories?: Article['categories']
  }) | null
): Promise<Article | null> {
  if (!article) {
    return null
  }

  const shortcodes = [
    ...extractVcSingleImageShortcodes(article.rawContent),
    ...extractVcSingleImageShortcodes(article.renderedContent),
    ...extractVcSingleImageShortcodes(article.elementorContent)
  ]

  const { rawContent, renderedContent, ...rest } = article

  if (!shortcodes.length) {
    return {
      ...rest,
      content: resolveArticleContent(article, new Map()),
      elementorContent: article.elementorContent ?? null
    }
  }

  const uniqueImageIds = Array.from(new Set(shortcodes.map((shortcode) => shortcode.imageId)))
  const mediaEntries = await Promise.all(
    uniqueImageIds.map(async (imageId) => [imageId, await fetchWordPressMediaById(imageId)] as const)
  )
  const mediaById = new Map<number, WordPressMediaResponse>(
    mediaEntries.filter((entry): entry is readonly [number, WordPressMediaResponse] => Boolean(entry[1]))
  )

  return {
    ...rest,
    content: resolveArticleContent(article, mediaById),
    elementorContent: replaceVcSingleImageShortcodes(article.elementorContent, mediaById)
  }
}

function resolveArticleContent(
  article: Pick<ArticleQueryData, 'rawContent' | 'renderedContent'>,
  mediaById: Map<number, WordPressMediaResponse>
) {
  const rawContent = article.rawContent?.trim()

  if (rawContent && contentHasVcShortcodes(rawContent) && rawContentHasOnlySupportedVcShortcodes(rawContent)) {
    return transformVcRawContent(rawContent, mediaById)
  }

  const renderedContent = article.renderedContent?.trim()

  if (renderedContent) {
    return replaceVcSingleImageShortcodes(renderedContent, mediaById) ?? ''
  }

  return replaceVcSingleImageShortcodes(rawContent, mediaById) ?? ''
}

function extractVcSingleImageShortcodes(content?: string | null) {
  if (!content) {
    return []
  }

  return Array.from(content.matchAll(new RegExp(VC_SINGLE_IMAGE_REGEX.source, VC_SINGLE_IMAGE_REGEX.flags)))
    .map((match) => parseVcSingleImageShortcode(match[0] ?? ''))
    .filter((shortcode): shortcode is VcSingleImageShortcode => Boolean(shortcode))
}

function contentHasVcShortcodes(content?: string | null) {
  return content?.toLowerCase().includes('[vc') ?? false
}

function contentHasGutenbergBlocks(content?: string | null) {
  return content?.includes('<!-- wp:') ?? false
}

function rawContentHasOnlySupportedVcShortcodes(content: string) {
  const tagNames = Array.from(content.matchAll(new RegExp(VC_TAG_REGEX.source, VC_TAG_REGEX.flags))).map(
    (match) => (match[1] ?? '').replace(/^\//, '').toLowerCase()
  )

  return tagNames.every((tagName) => SUPPORTED_VC_SHORTCODES.has(tagName))
}

function parseVcSingleImageShortcode(shortcode: string): VcSingleImageShortcode | null {
  const match = shortcode.trim().match(/^\[vc_single_image([^\]]*)\]$/i)

  if (!match) {
    return null
  }

  const attributes = parseShortcodeAttributes(match[1] ?? '')
  const imageId = Number.parseInt(attributes.image ?? '', 10)

  if (!Number.isInteger(imageId) || imageId <= 0) {
    return null
  }

  return {
    raw: shortcode,
    imageId,
    imgSize: attributes.img_size,
    alignment: attributes.alignment
  }
}

function parseShortcodeAttributes(attributeBlock: string) {
  const attributes: Record<string, string> = {}

  for (const match of attributeBlock.matchAll(new RegExp(SHORTCODE_ATTRIBUTE_REGEX.source, SHORTCODE_ATTRIBUTE_REGEX.flags))) {
    const key = match[1]?.toLowerCase()
    const value = match[2] ?? match[3] ?? match[4] ?? ''

    if (!key) {
      continue
    }

    attributes[key] = value
  }

  return attributes
}

function getWordPressContentAuthHeaders() {
  const username = process.env.WORDPRESS_CONTACT_USER
  const password = process.env.WORDPRESS_CONTACT_APP_PASSWORD

  if (!username || !password) {
    return undefined
  }

  const token = Buffer.from(`${username}:${password}`).toString('base64')

  return {
    Authorization: `Basic ${token}`
  }
}

async function fetchWordPressMediaById(imageId: number) {
  try {
    return await fetchWordPressRest<WordPressMediaResponse>(`wp/v2/media/${imageId}`, {
      cache: 'force-cache'
    })
  } catch (error) {
    console.warn(`Failed to load WordPress media ${imageId}`, error)
    return null
  }
}

function replaceVcSingleImageShortcodes(
  content: string | null | undefined,
  mediaById: Map<number, WordPressMediaResponse>
) {
  if (!content) {
    return content
  }

  return content.replace(VC_SINGLE_IMAGE_BLOCK_REGEX, (_match, wrappedShortcode, inlineShortcode) => {
    const rawShortcode = wrappedShortcode ?? inlineShortcode ?? ''
    const shortcode = parseVcSingleImageShortcode(rawShortcode)

    if (!shortcode) {
      return rawShortcode
    }

    const media = mediaById.get(shortcode.imageId)

    if (!media) {
      return `<!-- Missing vc_single_image ${shortcode.imageId} -->`
    }

    return buildVcSingleImageMarkup(shortcode, media)
  })
}

function transformVcRawContent(content: string, mediaById: Map<number, WordPressMediaResponse>) {
  let transformed = content.replace(/\r\n?/g, '\n').trim()

  transformed = transformed.replace(/\[vc_column_text\]([\s\S]*?)\[\/vc_column_text\]/gi, (_match, innerContent) => {
    return `<div class="vc-text">${formatVcTextContent(innerContent ?? '')}</div>`
  })

  transformed = transformed.replace(/\[vc_text_separator([^\]]*)\]/gi, (_match, attributeBlock) => {
    return buildVcTextSeparatorMarkup(parseShortcodeAttributes(attributeBlock ?? ''))
  })

  transformed = replaceVcSingleImageShortcodes(transformed, mediaById) ?? ''

  transformed = transformed.replace(/\[vc_row([^\]]*)\]/gi, (_match, attributeBlock) => {
    return buildVcRowOpenTag(parseShortcodeAttributes(attributeBlock ?? ''))
  })
  transformed = transformed.replace(/\[\/vc_row\]/gi, '</div>')

  transformed = transformed.replace(/\[vc_column([^\]]*)\]/gi, (_match, attributeBlock) => {
    return buildVcColumnOpenTag(parseShortcodeAttributes(attributeBlock ?? ''))
  })
  transformed = transformed.replace(/\[\/vc_column\]/gi, '</div>')

  return transformed.replace(/\n{3,}/g, '\n\n').trim()
}

function formatVcTextContent(content: string) {
  const normalized = content.replace(/\r\n?/g, '\n').trim()

  if (!normalized) {
    return ''
  }

  return normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (/^\d+\.\s+.+$/.test(block) && !block.includes('\n')) {
        return `<h1>${block}</h1>`
      }

      if (/^<\s*(h[1-6]|p|ul|ol|blockquote|figure|div|table)\b/i.test(block)) {
        return block
      }

      return `<p>${block.split('\n').map((line) => line.trim()).filter(Boolean).join('<br />')}</p>`
    })
    .join('\n')
}

function buildVcTextSeparatorMarkup(attributes: Record<string, string>) {
  const title = attributes.title?.trim()

  if (!title) {
    return ''
  }

  return `<div class="vc-text-separator"><span>${escapeHtmlText(title)}</span></div>`
}

function buildVcRowOpenTag(attributes: Record<string, string>) {
  const classes = ['vc-row']

  if ((attributes.content_placement ?? '').toLowerCase() === 'middle') {
    classes.push('vc-row-middle')
  }

  return `<div class="${classes.join(' ')}">`
}

function buildVcColumnOpenTag(attributes: Record<string, string>) {
  const widthStyle = buildVcColumnWidthStyle(attributes.width)

  return `<div class="vc-col"${widthStyle}>`
}

function buildVcColumnWidthStyle(width?: string) {
  if (!width) {
    return ''
  }

  const match = width.match(/^(\d+)\s*\/\s*(\d+)$/)

  if (!match) {
    return ''
  }

  const numerator = Number.parseInt(match[1] ?? '', 10)
  const denominator = Number.parseInt(match[2] ?? '', 10)

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return ''
  }

  const percentage = (numerator / denominator) * 100

  if (!Number.isFinite(percentage) || percentage <= 0 || percentage >= 100) {
    return ''
  }

  return ` style="--vc-col-width: ${formatPercentage(percentage)};"`
}

function formatPercentage(value: number) {
  return `${value.toFixed(4).replace(/\.?0+$/, '')}%`
}

function buildVcSingleImageMarkup(
  shortcode: VcSingleImageShortcode,
  media: WordPressMediaResponse
) {
  const src = resolveMediaSource(media, shortcode.imgSize)

  if (!src) {
    return `<!-- Missing vc_single_image source ${shortcode.imageId} -->`
  }

  const dimensions = resolveMediaDimensions(media, shortcode.imgSize)
  const alt = escapeHtmlAttribute(media.alt_text ?? '')
  const width = dimensions.width ? ` width="${dimensions.width}"` : ''
  const height = dimensions.height ? ` height="${dimensions.height}"` : ''
  const alignmentClass = resolveAlignmentClass(shortcode.alignment)

  return `<figure class="wp-shortcode-figure ${alignmentClass}"><img class="wp-shortcode-image wp-image-${shortcode.imageId}" src="${escapeHtmlAttribute(src)}" alt="${alt}" loading="lazy" decoding="async"${width}${height} /></figure>`
}

function resolveMediaSource(media: WordPressMediaResponse, imgSize?: string) {
  if (!imgSize || imgSize === 'full') {
    return media.source_url ?? media.media_details?.sizes?.full?.source_url ?? null
  }

  return media.media_details?.sizes?.[imgSize]?.source_url ?? media.source_url ?? null
}

function resolveMediaDimensions(media: WordPressMediaResponse, imgSize?: string) {
  if (!imgSize || imgSize === 'full') {
    return {
      width: media.media_details?.width ?? null,
      height: media.media_details?.height ?? null
    }
  }

  const size = media.media_details?.sizes?.[imgSize]

  return {
    width: size?.width ?? media.media_details?.width ?? null,
    height: size?.height ?? media.media_details?.height ?? null
  }
}

function resolveAlignmentClass(alignment?: string) {
  switch ((alignment ?? '').toLowerCase()) {
    case 'left':
      return 'alignleft'
    case 'right':
      return 'alignright'
    default:
      return 'aligncenter'
  }
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeHtmlText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function requestElementorAssetsFromApi(postId?: number | null) {
  const params = new URLSearchParams()

  if (postId) {
    params.set('post_id', String(postId))
  }

  const query = params.toString()
  const path = query ? `elementor/v1/js-files?${query}` : 'elementor/v1/js-files'

  try {
    const { signal, clear } = createTimeoutController(ELEMENTOR_FETCH_TIMEOUT_MS)
    return await fetchWordPressRest<ElementorJsPayload>(path, { cache: 'force-cache', signal }).finally(() => {
      clear()
    })
  } catch (error) {
    console.warn('Failed to load Elementor JS assets from REST API', error)
    return null
  }
}

function hasElementorAssets(payload?: ElementorJsPayload | null) {
  if (!payload) {
    return false
  }
  const scriptCount = payload.scripts?.length ?? 0
  const inlineCount = payload.inline?.length ?? 0
  return scriptCount + inlineCount > 0
}

async function scrapeElementorAssetsFromPage(uri?: string | null) {
  if (!uri) {
    return null
  }

  const { siteUrl } = getWordPressConfig()
  const pageUrl = resolveWordPressPageUrl(siteUrl, uri)

  if (!pageUrl) {
    return null
  }

  try {
    const { signal, clear } = createTimeoutController(ELEMENTOR_FETCH_TIMEOUT_MS)
    const response = await fetch(pageUrl, { cache: 'force-cache', signal }).finally(() => {
      clear()
    })

    if (!response.ok) {
      throw new Error(`Failed to load Elementor page HTML: ${response.status}`)
    }

    const html = await response.text()
    return extractElementorAssetsFromHtml(html, pageUrl)
  } catch (error) {
    console.warn('Failed to scrape Elementor assets from fallback HTML', error)
    return null
  }
}

function resolveWordPressPageUrl(siteUrl: string, uri: string) {
  if (!siteUrl) {
    return null
  }

  try {
    if (/^https?:\/\//i.test(uri)) {
      return uri
    }
    const normalizedUri = uri.startsWith('/') ? uri : `/${uri}`
    return new URL(normalizedUri, siteUrl).toString()
  } catch (error) {
    console.warn('Failed to resolve WordPress page URL for Elementor fallback', uri, error)
    return null
  }
}

const ELEMENTOR_SCRIPT_HANDLES = new Set([
  'jquery-core',
  'jquery-migrate',
  'jquery-ui-core',
  'jquery-ui-position',
  'awot-flickity',
  'awot-flickity-hash',
  'awot-sticky',
  'awot-isinviewport',
  'awot-singleJS',
  'awot-mainJS',
  'comment-reply',
  'elementor-webpack-runtime',
  'elementor-frontend-modules',
  'elementor-frontend',
  'smartmenus',
  'e-sticky',
  'imagesloaded',
  'elementor-pro-webpack-runtime',
  'wp-hooks',
  'wp-i18n',
  'elementor-pro-frontend',
  'pro-elements-handlers'
])

const SCRIPT_TAG_REGEX = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi

function extractElementorAssetsFromHtml(html: string, baseUrl: string): ElementorJsPayload | null {
  const scripts = new Map<string, ElementorScriptAsset>()
  const inline = new Map<string, ElementorInlineScript>()

  SCRIPT_TAG_REGEX.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = SCRIPT_TAG_REGEX.exec(html))) {
    const attrBlock = match[1] ?? ''
    const content = match[2] ?? ''
    const { id, src } = parseScriptAttributes(attrBlock)

    if (!id) {
      continue
    }

    const normalizedId = normalizeScriptIdentifier(id)

    if (!normalizedId) {
      continue
    }

    if (src) {
      if (!ELEMENTOR_SCRIPT_HANDLES.has(normalizedId.handle)) {
        continue
      }
      const resolvedSrc = resolveAssetUrl(src, baseUrl)
      if (!resolvedSrc || scripts.has(normalizedId.handle)) {
        continue
      }

      scripts.set(normalizedId.handle, {
        handle: normalizedId.handle,
        src: resolvedSrc
      })
      continue
    }

    if (!normalizedId.timing) {
      continue
    }

    const inlineCode = content.trim()

    if (!inlineCode) {
      continue
    }

    inline.set(id, {
      id,
      target: normalizedId.handle,
      position: normalizedId.timing,
      code: inlineCode
    })
  }

  if (!scripts.size && !inline.size) {
    return null
  }

  return {
    scripts: Array.from(scripts.values()),
    inline: Array.from(inline.values())
  }
}

function parseScriptAttributes(attrBlock: string) {
  const result: { id?: string; src?: string } = {}

  const attrRegex = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi
  let match: RegExpExecArray | null
  while ((match = attrRegex.exec(attrBlock))) {
    const name = (match[1] ?? '').toLowerCase()
    const value = match[2] ?? match[3] ?? ''
    if (name === 'id') {
      result.id = value
    } else if (name === 'src') {
      result.src = value
    }
  }

  return result
}

function normalizeScriptIdentifier(id: string) {
  if (!id) {
    return null
  }

  const beforeAfterMatch = id.match(/^(.*?)-js-(before|after)$/)

  if (beforeAfterMatch) {
    return {
      handle: beforeAfterMatch[1],
      timing: beforeAfterMatch[2] as 'before' | 'after'
    }
  }

  if (id.endsWith('-js')) {
    return {
      handle: id.slice(0, -3),
      timing: null
    }
  }

  return {
    handle: id,
    timing: null
  }
}

function resolveAssetUrl(src: string, baseUrl: string) {
  if (!src) {
    return null
  }

  try {
    if (src.startsWith('//')) {
      const base = new URL(baseUrl)
      return `${base.protocol}${src}`
    }
    return new URL(src, baseUrl).toString()
  } catch (error) {
    console.warn('Failed to normalize Elementor asset URL', src, error)
    return null
  }
}
