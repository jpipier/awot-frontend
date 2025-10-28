import { NextResponse } from 'next/server'
import { searchPosts } from '@/lib/search'

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get('term') ?? ''

  if (term.length < 3) {
    return NextResponse.json([])
  }

  const posts = await searchPosts(60)
  const needle = normalize(term)

  const filtered = posts.filter((post) => {
    const title = normalize(post.title ?? '')
    const keywords = post.optionsArticles?.keywordSearch?.edges ?? []

    const keywordMatch = keywords.some((edge) => normalize(edge.node.name).includes(needle))

    return title.includes(needle) || keywordMatch
  })

  return NextResponse.json(
    filtered.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug
    }))
  )
}
