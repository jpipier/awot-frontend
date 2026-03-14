import { NextResponse } from 'next/server'
import { getCategoryPosts, getCategoryPostsByLocalisation } from '@/lib/categories'

interface Params {
  params: {
    slug: string
  }
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = params
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') ?? '10')
  const cursor = searchParams.get('cursor')
  const localisation = searchParams.get('localisation')

  if (!slug) {
    return NextResponse.json({ posts: [], pageInfo: { hasNextPage: false } })
  }

  if (localisation) {
    const result = await getCategoryPostsByLocalisation(slug, localisation, limit, cursor)
    return NextResponse.json(result)
  }

  const posts = await getCategoryPosts(slug, limit, cursor)

  return NextResponse.json(posts ?? { posts: [], pageInfo: { hasNextPage: false } })
}
