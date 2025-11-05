import { NextResponse } from 'next/server'
import type { InstagramOEmbedResponse } from '@/types/instagram'

const INSTAGRAM_OEMBED_ENDPOINT = 'https://graph.facebook.com/v17.0/instagram_oembed'
const DEFAULT_REVALIDATE_SECONDS = 60 * 10

function getOEmbedToken() {
  const token = process.env.INSTAGRAM_OEMBED_TOKEN ?? process.env.INSTAGRAM_ACCESS_TOKEN

  if (!token) {
    throw new Error('INSTAGRAM_OEMBED_TOKEN (ou INSTAGRAM_ACCESS_TOKEN) est requis pour utiliser oEmbed')
  }

  return token
}

function buildInstagramOEmbedUrl({
  url,
  maxwidth,
  hidecaption,
  omitscript
}: {
  url: string
  maxwidth?: string | null
  hidecaption?: string | null
  omitscript?: string | null
}) {
  const params = new URLSearchParams({
    url,
    access_token: getOEmbedToken()
  })

  if (maxwidth) {
    params.set('maxwidth', maxwidth)
  }

  if (hidecaption) {
    params.set('hidecaption', hidecaption)
  }

  if (omitscript) {
    params.set('omitscript', omitscript)
  }

  return `${INSTAGRAM_OEMBED_ENDPOINT}?${params.toString()}`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const embedUrl = searchParams.get('url')

    if (!embedUrl) {
      return NextResponse.json({ error: 'Paramètre `url` manquant' }, { status: 400 })
    }

    const maxwidth = searchParams.get('maxwidth')
    const hidecaption = searchParams.get('hidecaption') ?? 'false'
    const omitscript = searchParams.get('omitscript') ?? 'true'

    const oEmbedUrl = buildInstagramOEmbedUrl({
      url: embedUrl,
      maxwidth,
      hidecaption,
      omitscript
    })

    const response = await fetch(oEmbedUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: DEFAULT_REVALIDATE_SECONDS }
    })

    let payload: InstagramOEmbedResponse | null = null

    try {
      payload = (await response.json()) as InstagramOEmbedResponse
    } catch (error) {
      return NextResponse.json(
        { error: `Réponse oEmbed invalide (${(error as Error).message})` },
        { status: 502 }
      )
    }

    if (!response.ok) {
      const message = payload?.error?.message ?? 'Instagram oEmbed a échoué'
      return NextResponse.json({ error: message }, { status: response.status })
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Instagram oEmbed API error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
