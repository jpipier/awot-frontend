import { NextResponse } from 'next/server'
import { getInstagramOEmbed } from '@/lib/instagram'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const embedUrl = searchParams.get('url')

    if (!embedUrl) {
      return NextResponse.json({ error: 'Paramètre `url` manquant' }, { status: 400 })
    }

    const maxwidthParam = searchParams.get('maxwidth')
    const hidecaptionParam = searchParams.get('hidecaption')
    const omitscriptParam = searchParams.get('omitscript')

    const parsedMaxwidth = maxwidthParam ? Number(maxwidthParam) : undefined

    const payload = await getInstagramOEmbed(embedUrl, {
      maxwidth: Number.isFinite(parsedMaxwidth) ? parsedMaxwidth : undefined,
      hidecaption: hidecaptionParam ? hidecaptionParam === 'true' : undefined,
      omitscript: omitscriptParam ? omitscriptParam === 'true' : undefined
    })

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Instagram oEmbed API error:', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
