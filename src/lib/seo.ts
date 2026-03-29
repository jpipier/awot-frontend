import type { Metadata } from 'next'
import { getWordPressConfig } from './config'
import { fetchWordPressRest } from './wordpress'
import { sanitizeExcerptText } from './sanitize-excerpt-text'

const DEFAULT_YOAST_REVALIDATE_SECONDS = 300
const DESCRIPTION_MAX_LENGTH = 170

interface YoastImage {
  url?: string
  width?: number | string
  height?: number | string
  alt?: string
}

interface YoastHeadJson {
  title?: string
  description?: string
  canonical?: string
  og_title?: string
  og_description?: string
  og_type?: string
  og_site_name?: string
  og_url?: string
  og_image?: YoastImage[] | YoastImage | string
  twitter_title?: string
  twitter_description?: string
  twitter_card?: string
  twitter_image?: string | string[] | YoastImage
  robots?: Record<string, unknown>
}

interface YoastHeadResponse {
  json?: YoastHeadJson
  status?: number
}

interface YoastRestEntity {
  yoast_head_json?: YoastHeadJson | null
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function getPreferredSiteUrl() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_WORDPRESS_URL ??
    process.env.WORDPRESS_URL ??
    ''

  return trimTrailingSlash(siteUrl.trim())
}

function parseUrlSafe(value: string | null | undefined) {
  if (!value) {
    return null
  }

  try {
    return new URL(value)
  } catch {
    return null
  }
}

function normalizePath(value: string) {
  if (!value) {
    return '/'
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return value.startsWith('/') ? value : `/${value}`
}

function buildWordPressAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  const { siteUrl } = getWordPressConfig()
  if (!siteUrl) {
    return null
  }

  const origin = trimTrailingSlash(siteUrl.trim())
  return `${origin}${normalizePath(pathOrUrl)}`
}

function normalizeSeoText(value: string | null | undefined, maxLength?: number) {
  const normalized = sanitizeExcerptText(value)
  if (!normalized) {
    return ''
  }

  if (!maxLength || normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`
}

function resolveImageUrl(rawValue: string | null | undefined) {
  if (!rawValue) {
    return null
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue
  }

  const siteUrl = getPreferredSiteUrl()
  const site = parseUrlSafe(siteUrl)

  if (!site) {
    return null
  }

  try {
    return new URL(rawValue, site).toString()
  } catch {
    return null
  }
}

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

function mapYoastOgImages(value: YoastHeadJson['og_image']) {
  const images = Array.isArray(value) ? value : value ? [value] : []

  return images
    .map((image) => {
      if (typeof image === 'string') {
        const resolved = resolveImageUrl(image)
        if (!resolved) {
          return null
        }

        return { url: resolved }
      }

      const resolved = resolveImageUrl(image.url)
      if (!resolved) {
        return null
      }

      return {
        url: resolved,
        width: asNumber(image.width),
        height: asNumber(image.height),
        alt: normalizeSeoText(image.alt)
      }
    })
    .filter((image): image is NonNullable<typeof image> => Boolean(image))
}

function mapYoastTwitterImages(
  value: YoastHeadJson['twitter_image'],
  ogImages: ReturnType<typeof mapYoastOgImages>
) {
  const images = Array.isArray(value) ? value : value ? [value] : []

  const mapped = images
    .map((image) => {
      if (typeof image === 'string') {
        return resolveImageUrl(image)
      }

      return resolveImageUrl(image.url)
    })
    .filter((image): image is string => Boolean(image))

  if (mapped.length) {
    return mapped
  }

  return ogImages.map((image) => image.url)
}

function mapYoastRobots(value: YoastHeadJson['robots']) {
  if (!value || process.env.YOAST_SYNC_ROBOTS !== 'true') {
    return undefined
  }

  const rawIndex = String(value.index ?? '').toLowerCase().trim()
  const rawFollow = String(value.follow ?? '').toLowerCase().trim()

  return {
    index: rawIndex ? rawIndex !== 'noindex' : true,
    follow: rawFollow ? rawFollow !== 'nofollow' : true
  } satisfies Metadata['robots']
}

function mapTwitterCard(value: string | null | undefined) {
  switch ((value ?? '').trim().toLowerCase()) {
    case 'summary':
      return 'summary'
    case 'summary_large_image':
      return 'summary_large_image'
    case 'app':
      return 'app'
    case 'player':
      return 'player'
    default:
      return undefined
  }
}

function mapCanonical(canonical: string | null | undefined) {
  if (!canonical || process.env.YOAST_SYNC_CANONICAL !== 'true') {
    return undefined
  }

  const frontendSite = parseUrlSafe(getPreferredSiteUrl())
  const sourceUrl = parseUrlSafe(canonical)

  if (!sourceUrl) {
    return undefined
  }

  if (!frontendSite) {
    return sourceUrl.toString()
  }

  return new URL(`${sourceUrl.pathname}${sourceUrl.search}${sourceUrl.hash}`, frontendSite).toString()
}

export function getMetadataBaseUrl() {
  return parseUrlSafe(getPreferredSiteUrl()) ?? undefined
}

export function toSeoDescription(value: string | null | undefined) {
  return normalizeSeoText(value, DESCRIPTION_MAX_LENGTH)
}

export function mergeMetadataWithFallback(primary: Metadata | null | undefined, fallback: Metadata): Metadata {
  if (!primary) {
    return fallback
  }

  return {
    ...fallback,
    ...primary,
    alternates: {
      ...(fallback.alternates ?? {}),
      ...(primary.alternates ?? {})
    },
    openGraph: {
      ...(fallback.openGraph ?? {}),
      ...(primary.openGraph ?? {})
    },
    twitter: {
      ...(fallback.twitter ?? {}),
      ...(primary.twitter ?? {})
    },
    robots: primary.robots ?? fallback.robots
  }
}

function mapYoastJsonToMetadata(json: YoastHeadJson): Metadata {
  const title = normalizeSeoText(json.title)
  const description = normalizeSeoText(json.description, DESCRIPTION_MAX_LENGTH)
  const ogImages = mapYoastOgImages(json.og_image)
  const twitterImages = mapYoastTwitterImages(json.twitter_image, ogImages)
  const canonical = mapCanonical(json.canonical)

  const metadata: Metadata = {}

  if (title) {
    metadata.title = { absolute: title }
  }

  if (description) {
    metadata.description = description
  }

  if (canonical) {
    metadata.alternates = { canonical }
  }

  const openGraph: Record<string, unknown> = {}

  const openGraphTitle = normalizeSeoText(json.og_title) || title
  const openGraphDescription = normalizeSeoText(json.og_description, DESCRIPTION_MAX_LENGTH) || description

  if (json.og_type) {
    openGraph.type = json.og_type
  }

  if (openGraphTitle) {
    openGraph.title = openGraphTitle
  }

  if (openGraphDescription) {
    openGraph.description = openGraphDescription
  }

  if (json.og_site_name) {
    openGraph.siteName = normalizeSeoText(json.og_site_name)
  }

  if (json.og_url && process.env.YOAST_SYNC_CANONICAL === 'true') {
    const mappedOgUrl = mapCanonical(json.og_url)
    if (mappedOgUrl) {
      openGraph.url = mappedOgUrl
    }
  }

  if (ogImages.length) {
    openGraph.images = ogImages
  }

  if (Object.keys(openGraph).length) {
    metadata.openGraph = openGraph as NonNullable<Metadata['openGraph']>
  }

  const twitter: Record<string, unknown> = {}
  const twitterTitle = normalizeSeoText(json.twitter_title) || openGraphTitle || title
  const twitterDescription =
    normalizeSeoText(json.twitter_description, DESCRIPTION_MAX_LENGTH) || openGraphDescription || description
  const twitterCard = mapTwitterCard(json.twitter_card)

  if (twitterCard) {
    twitter.card = twitterCard
  }

  if (twitterTitle) {
    twitter.title = twitterTitle
  }

  if (twitterDescription) {
    twitter.description = twitterDescription
  }

  if (twitterImages.length) {
    twitter.images = twitterImages
  }

  if (Object.keys(twitter).length) {
    metadata.twitter = twitter as NonNullable<Metadata['twitter']>
  }

  const robots = mapYoastRobots(json.robots)
  if (robots) {
    metadata.robots = robots
  }

  return metadata
}

function mapYoastJsonResponseToMetadata(json: YoastHeadJson | null | undefined) {
  if (!json) {
    return null
  }

  const mapped = mapYoastJsonToMetadata(json)
  return Object.keys(mapped).length ? mapped : null
}

async function getYoastMetadataFromRestEntity(
  endpoint: string,
  slug: string,
  options?: { revalidate?: number }
): Promise<Metadata | null> {
  const normalizedSlug = slug.trim()

  if (!normalizedSlug) {
    return null
  }

  try {
    const records = await fetchWordPressRest<YoastRestEntity[]>(
      `${endpoint}?slug=${encodeURIComponent(normalizedSlug)}&per_page=1`,
      {
        next: { revalidate: options?.revalidate ?? DEFAULT_YOAST_REVALIDATE_SECONDS }
      }
    )

    const firstRecord = Array.isArray(records) ? records[0] : null
    return mapYoastJsonResponseToMetadata(firstRecord?.yoast_head_json ?? null)
  } catch (error) {
    console.warn(`Unable to load Yoast metadata for ${endpoint} slug=${normalizedSlug}`, error)
    return null
  }
}

export async function getYoastMetadataForWpUrl(
  pathOrUrl: string,
  options?: { revalidate?: number }
): Promise<Metadata | null> {
  const targetUrl = buildWordPressAbsoluteUrl(pathOrUrl)

  if (!targetUrl) {
    return null
  }

  try {
    const response = await fetchWordPressRest<YoastHeadResponse>(
      `yoast/v1/get_head?url=${encodeURIComponent(targetUrl)}`,
      {
        next: { revalidate: options?.revalidate ?? DEFAULT_YOAST_REVALIDATE_SECONDS }
      }
    )

    if (!response?.json || response.status !== 200) {
      return null
    }

    return mapYoastJsonResponseToMetadata(response.json)
  } catch (error) {
    console.warn('Unable to load Yoast metadata', targetUrl, error)
    return null
  }
}

export async function getYoastMetadataForWpPath(
  path: string,
  options?: { revalidate?: number }
): Promise<Metadata | null> {
  return getYoastMetadataForWpUrl(normalizePath(path), options)
}

export async function getYoastMetadataForPostSlug(
  slug: string,
  options?: { revalidate?: number }
): Promise<Metadata | null> {
  return getYoastMetadataFromRestEntity('wp/v2/posts', slug, options)
}

export async function getYoastMetadataForPageSlug(
  slug: string,
  options?: { revalidate?: number }
): Promise<Metadata | null> {
  return getYoastMetadataFromRestEntity('wp/v2/pages', slug, options)
}

export async function getYoastMetadataForCategorySlug(
  slug: string,
  options?: { revalidate?: number }
): Promise<Metadata | null> {
  return getYoastMetadataFromRestEntity('wp/v2/categories', slug, options)
}
