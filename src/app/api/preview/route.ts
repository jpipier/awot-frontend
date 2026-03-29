import { draftMode } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { fetchWordPressGraphQL } from '@/lib/wordpress'

interface PreviewPostResponse {
  post: {
    databaseId?: number | null
  } | null
}

const PREVIEW_POST_QUERY = /* GraphQL */ `
  query ResolvePreviewPost($id: ID!) {
    post(id: $id, idType: DATABASE_ID, asPreview: true) {
      databaseId
    }
  }
`

const PREVIEW_ID_KEYS = ['p', 'post_id', 'preview_id', 'page_id', 'id'] as const

function parsePositiveInt(value: string | null): number | null {
  if (!value) {
    return null
  }

  const numeric = Number.parseInt(value, 10)

  if (!Number.isInteger(numeric) || numeric <= 0) {
    return null
  }

  return numeric
}

function extractPreviewId(searchParams: URLSearchParams): number | null {
  for (const key of PREVIEW_ID_KEYS) {
    const parsed = parsePositiveInt(searchParams.get(key))
    if (parsed) {
      return parsed
    }
  }

  return null
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

export async function GET(request: NextRequest) {
  const configuredSecret = process.env.WORDPRESS_PREVIEW_SECRET?.trim()
  const providedSecret =
    request.nextUrl.searchParams.get('secret') ?? request.nextUrl.searchParams.get('preview_secret')

  if (!configuredSecret) {
    return NextResponse.json(
      { message: 'Preview secret is not configured on frontend' },
      { status: 500 }
    )
  }

  if (providedSecret !== configuredSecret) {
    return NextResponse.json({ message: 'Invalid preview secret' }, { status: 401 })
  }

  const previewId = extractPreviewId(request.nextUrl.searchParams)

  if (!previewId) {
    return NextResponse.json({ message: 'Missing preview identifier' }, { status: 400 })
  }

  try {
    const data = await fetchWordPressGraphQL<PreviewPostResponse>(PREVIEW_POST_QUERY, {
      variables: { id: String(previewId) },
      cache: 'no-store',
      headers: getWordPressContentAuthHeaders()
    })

    if (!data.post) {
      return NextResponse.json({ message: 'Post preview not found' }, { status: 404 })
    }

    draftMode().enable()
    const target = new URL(`/articles/preview/${previewId}`, request.url)
    target.searchParams.set('secret', providedSecret)

    return NextResponse.redirect(target)
  } catch (error) {
    console.error('WordPress preview resolution error', error)
    return NextResponse.json({ message: 'Unable to resolve preview' }, { status: 500 })
  }
}
