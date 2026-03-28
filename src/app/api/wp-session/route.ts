import { NextResponse } from 'next/server'
import {
  hasWordPressEditorSessionCookie,
  hasWordPressEditorSessionInCookieHeader
} from '@/lib/wordpress'

export function GET(request: Request) {
  const loggedIn = hasWordPressEditorSessionCookie()
  const cookieHeader = request.headers.get('cookie')
  const cookieNames = request.headers
    .get('cookie')
    ?.split(';')
    .map((entry) => entry.trim().split('=')[0])
    .filter(Boolean) ?? []
  const wpCookieNames = cookieNames.filter(
    (name) => name.startsWith('wordpress_') || name.startsWith('wp-') || name.startsWith('wp_')
  )

  console.info('[wp-session] cookie debug', {
    loggedIn,
    hasHeaderMatch: hasWordPressEditorSessionInCookieHeader(cookieHeader),
    totalCookieNames: cookieNames.length,
    wpCookieNames
  })

  return NextResponse.json(
    { loggedIn },
    {
      headers: {
        'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0'
      }
    }
  )
}
