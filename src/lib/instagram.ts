import type { InstagramApiResponse, InstagramPost } from '@/types/instagram'

const INSTAGRAM_GRAPH_API = 'https://graph.instagram.com'
const DEFAULT_FIELDS = [
  'id',
  'caption',
  'media_type',
  'media_url',
  'permalink',
  'thumbnail_url',
  'timestamp',
  'username'
]
const DEFAULT_LIMIT = 6
const DEFAULT_REVALIDATE_SECONDS = 60 * 10 // 10 minutes keeps the feed reasonably fresh

export interface GetInstagramPostsOptions {
  limit?: number
  fields?: string[]
  userId?: string
  revalidate?: number
}

function getAccessToken() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN

  if (!token) {
    throw new Error('Missing INSTAGRAM_ACCESS_TOKEN environment variable')
  }

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

  const targetUser = userId?.trim() ? userId.trim() : 'me'

  return `${INSTAGRAM_GRAPH_API}/${targetUser}/media?${params.toString()}`
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

  if (revalidate === 0) {
    fetchOptions.cache = 'no-store'
  } else if (typeof revalidate === 'number' && Number.isFinite(revalidate)) {
    fetchOptions.next = { revalidate }
  }

  const response = await fetch(url, fetchOptions)
  let payload: InstagramApiResponse | null = null

  try {
    payload = (await response.json()) as InstagramApiResponse
  } catch (error) {
    // Instagram sometimes returns HTML when the token expires – surface a clearer error
    throw new Error(`Instagram API returned an unreadable response (${(error as Error).message})`)
  }

  if (!response.ok) {
    const errorMessage = payload?.error?.message ?? response.statusText
    throw new Error(`Instagram API request failed (${response.status}): ${errorMessage}`)
  }

  if (payload?.error) {
    throw new Error(payload.error.message ?? 'Unknown Instagram API error')
  }

  return payload?.data ?? []
}
