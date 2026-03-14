import { notFound } from 'next/navigation'
import Footer from '@/components/footer/Footer'
import CategoryPageClient from '@/components/categories/CategoryPageClient'
import { getCategoryPage, getCategoryPunchlineBySlug, getLocalisations } from '@/lib/categories'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  const [category, categoryPunchline] = await Promise.all([
    getCategoryPage(slug, 12),
    getCategoryPunchlineBySlug(slug)
  ])

  if (!category) {
    notFound()
  }

  const posts = category.posts?.nodes ?? []
  const pageInfo = category.posts?.pageInfo
  const children = category.children?.nodes ?? []
  const siblingNodes = category.parent?.node?.children?.nodes ?? []
  const subcategories = children.length ? children : siblingNodes

  const parentSlug = category.parent?.node?.slug
  const isGuideChild = parentSlug === 'guide-pays-basque-l-landes'
  const localisations = isGuideChild ? await getLocalisations() : []

  return (
    <div>
      <CategoryPageClient
        slug={slug}
        categoryName={category.name ?? ''}
        categoryPunchline={categoryPunchline}
        initialPosts={posts}
        initialCursor={pageInfo?.endCursor}
        hasNextPage={Boolean(pageInfo?.hasNextPage)}
        subcategories={isGuideChild ? [] : subcategories}
        localisations={localisations}
      />
      <Footer />
    </div>
  )
}
