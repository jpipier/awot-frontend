import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Footer from '@/components/footer/Footer'
import CategoryPageClient from '@/components/categories/CategoryPageClient'
import { getCategoryPage, getCategoryPunchlineBySlug, getFiltres, getLocalisations } from '@/lib/categories'
import { getYoastMetadataForCategorySlug, getYoastMetadataForWpUrl, mergeMetadataWithFallback, toSeoDescription } from '@/lib/seo'
import { sanitizeExcerptText } from '@/lib/sanitize-excerpt-text'
import { getArchiveCategorySlugs, isArchiveNoindexEnabled } from '@/lib/site-config'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = params
  const [category, categoryPunchline] = await Promise.all([
    getCategoryPage(slug, 12),
    getCategoryPunchlineBySlug(slug)
  ])

  if (!category) {
    return {
      title: 'Categorie introuvable',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const title = sanitizeExcerptText(category.name)
  const description =
    toSeoDescription(categoryPunchline) || toSeoDescription(category.description) || 'Explorez notre guide local.'
  const fallback: Metadata = {
    title: title || 'Categorie',
    description,
    alternates: {
      canonical: `/categories/${slug}`
    }
  }

  const yoastMetadata =
    (await getYoastMetadataForCategorySlug(slug)) ??
    (await getYoastMetadataForWpUrl(category.link ?? category.uri ?? `/category/${slug}/`))
  const merged = mergeMetadataWithFallback(yoastMetadata, fallback)

  if (isArchiveNoindexEnabled() && getArchiveCategorySlugs().includes(slug)) {
    return { ...merged, robots: { index: false, follow: true } }
  }

  return merged
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  const [category, categoryPunchline, filtres] = await Promise.all([
    getCategoryPage(slug, 12),
    getCategoryPunchlineBySlug(slug),
    getFiltres(slug)
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
        filtres={filtres}
      />
      <Footer />
    </div>
  )
}
