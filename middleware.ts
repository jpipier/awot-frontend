import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PREVIEW_ID_KEYS = ['p', 'post_id', 'preview_id', 'page_id', 'id'] as const
const WORDPRESS_EDITOR_COOKIE_PREFIXES = ['wordpress_logged_in_', 'wordpress_sec_'] as const

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

function hasWordPressEditorSession(request: NextRequest) {
  return request.cookies
    .getAll()
    .some(({ name }) => WORDPRESS_EDITOR_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix)))
}

function applyNoCacheHeaders(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate, max-age=0')
  response.headers.set('CDN-Cache-Control', 'no-store')
  response.headers.set('Vercel-CDN-Cache-Control', 'no-store')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const shouldDisableCache = hasWordPressEditorSession(request)

  if (
    pathname.startsWith('/api/preview') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    const passthrough = NextResponse.next()
    if (shouldDisableCache) {
      applyNoCacheHeaders(passthrough)
    }
    return passthrough
  }

  const hasPreviewIntent =
    searchParams.get('preview') === 'true' ||
    searchParams.has('preview_nonce') ||
    searchParams.has('preview_id')

  if (!hasPreviewIntent) {
    const passthrough = NextResponse.next()
    if (shouldDisableCache) {
      applyNoCacheHeaders(passthrough)
    }
    return passthrough
  }

  const previewId = extractPreviewId(searchParams)

  if (!previewId) {
    const passthrough = NextResponse.next()
    if (shouldDisableCache) {
      applyNoCacheHeaders(passthrough)
    }
    return passthrough
  }

  const previewUrl = request.nextUrl.clone()
  previewUrl.pathname = '/api/preview'

  const redirect = NextResponse.redirect(previewUrl)
  if (shouldDisableCache) {
    applyNoCacheHeaders(redirect)
  }
  return redirect
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|_next/data).*)']
}
