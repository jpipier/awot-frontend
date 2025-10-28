import GuideLayoutClient from './GuideLayoutClient'
import { getPostsByCategory } from '@/lib/posts'

interface GuideLayoutProps {
  categorie?: {
    nodes: Array<{ slug: string }>
  }
  lien?: {
    title?: string | null
    url?: string | null
  }
}

export default async function GuideLayout({ categorie, lien }: GuideLayoutProps) {
  const slug = categorie?.nodes?.[0]?.slug ?? ''
  const posts = slug ? await getPostsByCategory(slug, 10) : []

  if (!posts.length) {
    return null
  }

  return <GuideLayoutClient posts={posts} link={lien} />
}
