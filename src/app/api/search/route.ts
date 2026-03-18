import { NextResponse } from 'next/server'
import { searchPostsByTerm } from '@/lib/search'
import { getArticleAlt, getArticleLocationLabel, getArticlePortraitImage } from '@/lib/article-card'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get('term') ?? ''
  const parsedLimit = Number(searchParams.get('limit') ?? '6')
  const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 12) : 6

  if (term.length < 3) {
    return NextResponse.json([])
  }

  const filtered = await searchPostsByTerm(term, 160)

  return NextResponse.json(
    filtered.slice(0, limit).map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      image: getArticlePortraitImage(post) || null,
      imageAlt: getArticleAlt(post),
      location: getArticleLocationLabel(post) || null
    }))
  )
}
