import PortraitLayoutClient from './PortraitLayoutClient'
import { getPostsByCategory } from '@/lib/posts'

interface PortraitLayoutProps {
  titreDeLaSection?: string | null
  categorie?: {
    nodes: Array<{ slug: string }>
  }
  postParPage?: number | null
  contenu?: string | null
}

export default async function PortraitLayout({
  titreDeLaSection,
  categorie,
  postParPage,
  contenu
}: PortraitLayoutProps) {
  const slug = categorie?.nodes?.[0]?.slug ?? ''
  const limit = typeof postParPage === 'number' ? postParPage : Number(postParPage) || 6
  const posts = slug ? await getPostsByCategory(slug, limit) : []

  if (!posts.length) {
    return null
  }

  return (
    <PortraitLayoutClient
      posts={posts}
      titreDeLaSection={titreDeLaSection ?? ''}
      contenu={contenu ?? ''}
    />
  )
}
