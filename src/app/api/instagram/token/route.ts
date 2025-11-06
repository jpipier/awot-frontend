import { NextResponse } from 'next/server'

const INSTAGRAM_OAUTH_URL = 'https://api.instagram.com/oauth/access_token'
const INSTAGRAM_LONG_LIVED_URL = 'https://graph.instagram.com/access_token'

function getAppConfig() {
  const clientId = process.env.META_APP_ID
  const clientSecret = process.env.META_APP_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('META_APP_ID et META_APP_SECRET doivent être configurées dans les variables d’environnement.')
  }

  return { clientId, clientSecret }
}

async function exchangeShortLivedToken({
  code,
  redirectUri
}: {
  code: string
  redirectUri: string
}) {
  const { clientId, clientSecret } = getAppConfig()

  const payload = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code
  })

  const response = await fetch(INSTAGRAM_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payload
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = body?.error_message ?? body?.error_description ?? response.statusText
    throw new Error(message || 'Impossible de récupérer le token Instagram (short-lived).')
  }

  return body as {
    access_token: string
    user_id?: number
    expires_in?: number
  }
}

async function exchangeLongLivedToken(shortToken: string) {
  const { clientSecret } = getAppConfig()

  const params = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: clientSecret,
    access_token: shortToken
  })

  const response = await fetch(`${INSTAGRAM_LONG_LIVED_URL}?${params.toString()}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok || !body?.access_token) {
    const message = body?.error?.message ?? body?.error_message ?? 'Impossible de générer le token long terme.'
    return { error: message }
  }

  return body as {
    access_token: string
    token_type?: string
    expires_in?: number
  }
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
      {
        error: 'Les paramètres "code" et "redirectUri" sont requis.'
      },
      { status: 400 }
    )
  }

  try {
    const shortToken = await exchangeShortLivedToken({ code, redirectUri })
    let longLived: Awaited<ReturnType<typeof exchangeLongLivedToken>> | null = null

    try {
      longLived = await exchangeLongLivedToken(shortToken.access_token)
    } catch (error) {
      longLived = { error: (error as Error).message }
    }

    return NextResponse.json({
      shortLived: shortToken,
      longLived
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Échec de l’échange du token Instagram.'
      },
      { status: 400 }
    )
  }
}
