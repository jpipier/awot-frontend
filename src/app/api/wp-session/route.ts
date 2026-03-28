import { NextRequest, NextResponse } from 'next/server'
import { hasWordPressEditorSessionInCookieHeader } from '@/lib/wordpress'

export function GET(request: NextRequest) {
  const loggedIn = hasWordPressEditorSessionInCookieHeader(request.headers.get('cookie'))

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
