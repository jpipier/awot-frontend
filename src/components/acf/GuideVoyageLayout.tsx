import GuideVoyageLayoutClient from './GuideVoyageLayoutClient'
import CategoryMenu from '@/components/menu/CategoryMenu'
import { getPostsByCategory } from '@/lib/posts'
import type { Article } from '@/types/wordpress'

interface GuideVoyageLayoutProps {
  titreDeLaSection?: string | null
  categorie?: {
    nodes: Array<{ slug: string }>
  }
  postParPage?: number | null
}

export default async function GuideVoyageLayout({
  titreDeLaSection,
  categorie,
  postParPage
}: GuideVoyageLayoutProps) {
  const slug = categorie?.nodes?.[0]?.slug ?? ''
  const limit = postParPage ?? 10
  const posts = slug ? await getPostsByCategory(slug, limit) : ([] as Article[])

  if (!posts.length) {
    return null
  }

  return (
    <section className="mx-auto my-20 max-w-screen-xl">
      <div className="flex flex-col items-center md:flex-row md:items-end">
        <h2 className="font-custom text-[60pt] md:text-[110pt] text-center md:text-left lg:pl-[15rem]">
          {titreDeLaSection}
        </h2>
        <CategoryMenu selectedSlug={slug} />
      </div>
      <GuideVoyageLayoutClient posts={posts} />
    </section>
  )
}
