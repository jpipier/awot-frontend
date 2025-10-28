import { notFound } from 'next/navigation'
import Footer from '@/components/footer/Footer'
import CategoryPageClient from '@/components/categories/CategoryPageClient'
import { getCategoryPage } from '@/lib/categories'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  const category = await getCategoryPage(slug, 12)

  if (!category) {
    notFound()
  }

  const posts = category.posts?.nodes ?? []
  const pageInfo = category.posts?.pageInfo
  const children = category.children?.nodes ?? []
  const siblingNodes = category.parent?.node?.children?.nodes ?? []
  const subcategories = children.length ? children : siblingNodes

  return (
    <div>
      <CategoryPageClient
        slug={slug}
        categoryName={category.name ?? ''}
        initialPosts={posts}
        initialCursor={pageInfo?.endCursor}
        hasNextPage={Boolean(pageInfo?.hasNextPage)}
        subcategories={subcategories}
      />
      <Footer />
    </div>
  )
}
