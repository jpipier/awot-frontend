// lib/instagram.ts (version IG Graph)

import type {
  InstagramApiResponse,
  InstagramOEmbedResponse,
  InstagramPost
} from '@/types/instagram'

const GRAPH_VERSION = process.env.IG_GRAPH_VERSION || 'v21.0'
const FB_GRAPH_API = `https://graph.facebook.com/${GRAPH_VERSION}`
const INSTAGRAM_OEMBED_ENDPOINT = `${FB_GRAPH_API}/instagram_oembed`

const DEFAULT_FIELDS = [
  'id',
  'caption',
  'media_type',
  'media_url',
  'permalink',
  'thumbnail_url',
  'timestamp',
  'children{media_type,media_url,thumbnail_url}'
]

const DEFAULT_LIMIT = 6
const DEFAULT_REVALIDATE_SECONDS = 60 * 10 // 10 min
const DEFAULT_OEMBED_MAXWIDTH = 540

export interface GetInstagramPostsOptions {
  limit?: number
  fields?: string[]
  userId?: string
  revalidate?: number
}

export interface InstagramOEmbedOptions {
  maxwidth?: number
  hidecaption?: boolean
  omitscript?: boolean
}

function getAccessToken() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) throw new Error('Missing INSTAGRAM_ACCESS_TOKEN environment variable')
  return token
}

function getOEmbedToken() {
  const token = process.env.INSTAGRAM_OEMBED_TOKEN ?? process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) throw new Error('Missing INSTAGRAM_OEMBED_TOKEN (or INSTAGRAM_ACCESS_TOKEN) env variable')
  return token
}

function buildInstagramUrl({
  userId,
  fields,
  limit,
  accessToken
}: {
  userId?: string | null
  fields: string[]
  limit: number
  accessToken: string
}) {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: fields.join(','),
    limit: String(Math.max(1, limit))
  })

  // ⚠️ IG Graph requiert l’IG User ID (1784...), pas "me"
  const targetUser = (userId && userId.trim()) || process.env.INSTAGRAM_USER_ID
  if (!targetUser) {
    throw new Error('Missing Instagram user id. Set INSTAGRAM_USER_ID env var.')
  }

  return `${FB_GRAPH_API}/${targetUser}/media?${params.toString()}`
}

export async function getInstagramPosts({
  limit = DEFAULT_LIMIT,
  fields = DEFAULT_FIELDS,
  userId = process.env.INSTAGRAM_USER_ID,
  revalidate = DEFAULT_REVALIDATE_SECONDS
}: GetInstagramPostsOptions = {}): Promise<InstagramPost[]> {
  const accessToken = getAccessToken()
  const url = buildInstagramUrl({ accessToken, fields, limit, userId })

  const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
    headers: { Accept: 'application/json' }
  }
  if (revalidate === 0) fetchOptions.cache = 'no-store'
  else if (Number.isFinite(revalidate)) fetchOptions.next = { revalidate }

  const response = await fetch(url, fetchOptions)
  let payload: InstagramApiResponse | null = null

  try {
    payload = (await response.json()) as InstagramApiResponse
  } catch (error) {
    throw new Error(`Instagram API returned an unreadable response (${(error as Error).message})`)
  }

  if (!response.ok) {
    const errorMessage = payload?.error?.message ?? response.statusText
    throw new Error(`Instagram API request failed (${response.status}): ${errorMessage}`)
  }
  if (payload?.error) throw new Error(payload.error.message ?? 'Unknown Instagram API error')

  return payload?.data ?? []
}

export async function getInstagramOEmbed(
  url: string,
  {
    maxwidth = DEFAULT_OEMBED_MAXWIDTH,
    hidecaption = true,
    omitscript = true
  }: InstagramOEmbedOptions = {}
): Promise<InstagramOEmbedResponse> {
  if (!url) {
    throw new Error('Instagram oEmbed requires a valid media URL')
  }

  const params = new URLSearchParams({
    url,
    access_token: getOEmbedToken(),
    hidecaption: hidecaption ? 'true' : 'false',
    omitscript: omitscript ? 'true' : 'false'
  })

  if (maxwidth) {
    params.set('maxwidth', String(Math.max(320, Math.min(maxwidth, 640))))
  }

  const response = await fetch(`${INSTAGRAM_OEMBED_ENDPOINT}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: DEFAULT_REVALIDATE_SECONDS }
  })

  let payload: InstagramOEmbedResponse | null = null

  try {
    payload = (await response.json()) as InstagramOEmbedResponse
  } catch (error) {
    throw new Error(`Instagram oEmbed returned an unreadable response (${(error as Error).message})`)
  }

  if (!response.ok) {
    const message = payload?.error?.message ?? response.statusText
    throw new Error(`Instagram oEmbed request failed (${response.status}): ${message}`)
  }

  if (!payload?.html) {
    throw new Error('Instagram oEmbed response did not include any embeddable HTML')
  }

  return payload
}
