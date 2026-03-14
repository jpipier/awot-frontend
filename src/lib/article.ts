import { fetchWordPressGraphQL, fetchWordPressRest } from './wordpress'
import { getWordPressConfig } from './config'
import type { Article, ElementorInlineScript, ElementorJsPayload, ElementorScriptAsset } from '@/types/wordpress'

interface ArticleResponse {
  postBy: Article & {
    optionsArticles?: Article['optionsArticles'] & {
      imagePortait?: {
        node?: {
          guid?: string | null
          srcSet?: string | null
        }
      }
    }
  }
}

const ARTICLE_BY_SLUG_QUERY = /* GraphQL */ `
  query GetPostBySlug($slug: String!) {
    postBy(slug: $slug) {
      databaseId
      title
      content
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
    }
  }
`

export async function getArticleBySlug(slug: string) {
  const data = await fetchWordPressGraphQL<ArticleResponse>(ARTICLE_BY_SLUG_QUERY, {
    variables: { slug },
    cache: 'no-store'
  })

  return data.postBy ?? null
}

export async function getElementorCssFiles() {
  return fetchWordPressRest<string[]>('elementor/v1/css-files')
}

export type ElementorCssAsset = {
  id: string
  content: string
}

export async function getElementorCssBundle(): Promise<ElementorCssAsset[]> {
  const files = await getElementorCssFiles()
  if (!files.length) {
    return []
  }

  const entries = await Promise.all(
    files.map(async (href) => {
      if (!href) {
        return null
      }
      try {
        const response = await fetch(href, { cache: 'no-store' })
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

async function requestElementorAssetsFromApi(postId?: number | null) {
  const params = new URLSearchParams()

  if (postId) {
    params.set('post_id', String(postId))
  }

  const query = params.toString()
  const path = query ? `elementor/v1/js-files?${query}` : 'elementor/v1/js-files'

  try {
    return await fetchWordPressRest<ElementorJsPayload>(path, { cache: 'no-store' })
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
    const response = await fetch(pageUrl, { cache: 'no-store' })

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
