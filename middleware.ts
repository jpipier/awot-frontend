import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (
    pathname.startsWith('/api/preview') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  const hasPreviewIntent =
    searchParams.get('preview') === 'true' ||
    searchParams.has('preview_nonce') ||
    searchParams.has('preview_id')

  if (!hasPreviewIntent) {
    return NextResponse.next()
  }

  const previewId = extractPreviewId(searchParams)

  if (!previewId) {
    return NextResponse.next()
  }

  const previewUrl = request.nextUrl.clone()
  previewUrl.pathname = '/api/preview'

  return NextResponse.redirect(previewUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_next/data).*)']
}
