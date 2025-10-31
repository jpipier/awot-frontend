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
    <div className="">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        {titreDeLaSection ? (
          <h2 className="font-custom text-4xl leading-tight md:text-[9rem] pl-[8rem] -mr-[7rem]">{titreDeLaSection}</h2>
        ) : null}
        <CategoryMenu selectedSlug={slug} />
      </div>
      <GuideVoyageLayoutClient posts={posts} />
    </div>
  )
}
