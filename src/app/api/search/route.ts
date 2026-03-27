import { NextResponse } from 'next/server'
import { searchSuggestionPostsByTerm } from '@/lib/search'
import { getArticleAlt, getArticleLocationLabel, getArticlePortraitImage } from '@/lib/article-card'

const SEARCH_POOL_SIZE = 160
const MAX_SUGGESTION_RESULTS = 6

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const term = (searchParams.get('term') ?? '').trim()
  const parsedLimit = Number(searchParams.get('limit') ?? String(MAX_SUGGESTION_RESULTS))
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.floor(parsedLimit), 1), MAX_SUGGESTION_RESULTS)
    : MAX_SUGGESTION_RESULTS

  if (term.length < 3) {
    return NextResponse.json([])
  }

  const filtered = await searchSuggestionPostsByTerm(term, SEARCH_POOL_SIZE)

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
