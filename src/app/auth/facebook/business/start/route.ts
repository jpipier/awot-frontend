import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const FACEBOOK_DIALOG_URL = 'https://www.facebook.com/v21.0/dialog/oauth'
const DEFAULT_SCOPES = [
  'public_profile',
  'email',
  'pages_show_list',
  'pages_read_engagement',
  'instagram_basic',
  'business_management'
]

function getAppId() {
  const appId = process.env.META_APP_ID

  if (!appId) {
    throw new Error('META_APP_ID environment variable is missing.')
  }

  return appId
}

function getRedirectUri(request: Request) {
  const configured = process.env.FACEBOOK_BUSINESS_REDIRECT_URI ?? process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI

  if (configured) {
    return configured.trim()
  }

  const { origin } = new URL(request.url)
  return `${origin}/auth/facebook/business/callback`
}

export async function GET(request: Request) {
  const appId = getAppId()
  const state = randomBytes(16).toString('hex')
  const redirectUri = getRedirectUri(request)
  const scopes = process.env.FACEBOOK_BUSINESS_SCOPES ?? DEFAULT_SCOPES.join(',')

  cookies().set('fb_login_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10
  })

  const authUrl = new URL(FACEBOOK_DIALOG_URL)
  authUrl.searchParams.set('client_id', appId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('state', state)

  return NextResponse.redirect(authUrl.toString())
}
