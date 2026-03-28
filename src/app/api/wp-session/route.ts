import { NextRequest, NextResponse } from 'next/server'
import { isWordPressEditorCookieName } from '@/lib/wordpress'

function hasWordPressEditorSession(request: NextRequest) {
  return request.cookies.getAll().some(({ name }) => isWordPressEditorCookieName(name))
}

export function GET(request: NextRequest) {
  return NextResponse.json({ loggedIn: hasWordPressEditorSession(request) })
}
