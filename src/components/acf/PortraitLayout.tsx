import PortraitLayoutClient from './PortraitLayoutClient'
import { getPostsByCategory } from '@/lib/posts'

interface PortraitLayoutProps {
  titreDeLaSection?: string | null
  categorie?: {
    nodes: Array<{ slug: string }>
  }
  postParPage?: number | null
  contenu?: string | null
  lien?: {
    target?: string | null
    title?: string | null
    url?: string | null
  }
}

export default async function PortraitLayout({
  titreDeLaSection,
  categorie,
  contenu,
  lien
}: PortraitLayoutProps) {
  const slug = categorie?.nodes?.[0]?.slug ?? ''
  const limit = 4
  const posts = slug ? await getPostsByCategory(slug, limit) : []

  if (!posts.length) {
    return null
  }

  return (
    <PortraitLayoutClient
      posts={posts}
      titreDeLaSection={titreDeLaSection ?? ''}
      contenu={contenu ?? ''}
      categorySlug={slug || undefined}
      link={lien ?? undefined}
    />
  )
}
