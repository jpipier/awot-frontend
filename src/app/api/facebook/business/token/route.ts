import { NextResponse } from 'next/server'

const GRAPH_BASE = 'https://graph.facebook.com/v21.0'

function getAppConfig() {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('META_APP_ID et META_APP_SECRET doivent être renseignées côté serveur.')
  }

  return { appId, appSecret }
}

async function fetchGraph<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const payload = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } }

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? response.statusText)
  }

  return payload as T
}

async function exchangeShortToken({
  code,
  redirectUri
}: {
  code: string
  redirectUri: string
}) {
  const { appId, appSecret } = getAppConfig()
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    client_secret: appSecret,
    code
  })

  return fetchGraph<{
    access_token: string
    token_type?: string
    expires_in?: number
  }>(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`)
}

async function exchangeLongToken(shortToken: string) {
  const { appId, appSecret } = getAppConfig()
  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortToken
  })

  return fetchGraph<{
    access_token: string
    token_type?: string
    expires_in?: number
  }>(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`)
}

async function debugToken(inputToken: string) {
  const { appId, appSecret } = getAppConfig()
  const params = new URLSearchParams({
    input_token: inputToken,
    access_token: `${appId}|${appSecret}`
  })

  return fetchGraph<{ data: Record<string, unknown> }>(`${GRAPH_BASE}/debug_token?${params.toString()}`)
}

export async function POST(request: Request) {
  let payload: { code?: string; redirectUri?: string }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload JSON invalide.' }, { status: 400 })
  }

  const code = payload.code?.trim()
  const redirectUri = payload.redirectUri?.trim()

  if (!code || !redirectUri) {
    return NextResponse.json(
      { error: 'Les champs "code" et "redirectUri" sont requis.' },
      { status: 400 }
    )
  }

  try {
    const shortLived = await exchangeShortToken({ code, redirectUri })
    let longLived:
      | {
          access_token?: string
          token_type?: string
          expires_in?: number
          error?: string
        }
      | null = null

    try {
      longLived = await exchangeLongToken(shortLived.access_token)
    } catch (error) {
      longLived = { error: error instanceof Error ? error.message : 'Impossible de créer le token long terme.' }
    }

    let debugInfo: Record<string, unknown> | undefined

    try {
      const tokenToDebug = longLived?.access_token ?? shortLived.access_token
      const debugPayload = await debugToken(tokenToDebug)
      debugInfo = debugPayload.data
    } catch {
      debugInfo = undefined
    }

    return NextResponse.json({
      shortLived,
      longLived,
      debug: debugInfo
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Impossible d’échanger le code Facebook.' },
      { status: 400 }
    )
  }
}
