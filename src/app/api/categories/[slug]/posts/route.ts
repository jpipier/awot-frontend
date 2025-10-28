import { NextResponse } from 'next/server'
import { getCategoryPosts } from '@/lib/categories'

interface Params {
  params: {
    slug: string
  }
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = params
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') ?? '10')
  const page = Number(searchParams.get('page') ?? '1')

  if (!slug) {
    return NextResponse.json({ posts: [], pageInfo: { hasNextPage: false } })
  }

  const offset = (Math.max(page, 1) - 1) * limit
  const posts = await getCategoryPosts(slug, limit, offset)

  return NextResponse.json(posts ?? { posts: [], pageInfo: { hasNextPage: false } })
}
