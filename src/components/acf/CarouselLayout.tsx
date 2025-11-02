import CarouselLayoutClient from './CarouselLayoutClient'
import { getPostsByCategory } from '@/lib/posts'

interface CarouselLayoutProps {
  titreDeLaSection?: string | null
  headline?: string | null
  contenu?: string | null
  categorie?: {
    nodes: Array<{ slug: string }>
  }
  postParPage?: number | null
}

export default async function CarouselLayout({
  titreDeLaSection,
  headline,
  contenu,
  categorie
}: CarouselLayoutProps) {
  const slug = categorie?.nodes?.[0]?.slug ?? ''
  const limit = 4
  const posts = slug ? await getPostsByCategory(slug, limit) : []

  if (!posts.length) {
    return null
  }

  return (
    <CarouselLayoutClient
      posts={posts}
      titreDeLaSection={titreDeLaSection}
      headline={headline}
      contenu={contenu}
      postParPage={posts.length}
      categorySlug={slug}
    />
  )
}
