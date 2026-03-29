import { NextResponse } from 'next/server'
import {
  getCategoryPosts,
  getCategoryPostsByFiltre,
  getCategoryPostsByLocalisation,
  getCategoryPostsByLocalisationAndFiltre
} from '@/lib/categories'

interface Params {
  params: {
    slug: string
  }
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const PROD_CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
const DEV_CACHE_CONTROL = 'no-store'

function jsonWithCache<T>(payload: T) {
  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': IS_PRODUCTION ? PROD_CACHE_CONTROL : DEV_CACHE_CONTROL
    }
  })
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = params
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get('limit') ?? '10')
  const cursor = searchParams.get('cursor')
  const localisation = searchParams.get('localisation')
  const filtres = Array.from(
    new Set(
      searchParams
        .getAll('filtre')
        .flatMap((value) => value.split(','))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  )

  if (!slug) {
    return jsonWithCache({ nodes: [], pageInfo: { hasNextPage: false } })
  }

  if (localisation && filtres.length > 0) {
    const result = await getCategoryPostsByLocalisationAndFiltre(slug, localisation, filtres, limit, cursor)
    return jsonWithCache(result)
  }

  if (localisation) {
    const result = await getCategoryPostsByLocalisation(slug, localisation, limit, cursor)
    return jsonWithCache(result)
  }

  if (filtres.length > 0) {
    const result = await getCategoryPostsByFiltre(slug, filtres, limit, cursor)
    return jsonWithCache(result)
  }

  const posts = await getCategoryPosts(slug, limit, cursor)

  return jsonWithCache(posts ?? { nodes: [], pageInfo: { hasNextPage: false } })
}
