import PostFooterClient from './PostFooterClient'
import { getPostsByCategory, getRecentPosts } from '@/lib/posts'
import type { CategoryNode } from '@/types/wordpress'

interface PostFooterProps {
  categories?: CategoryNode[]
  excludeSlug?: string
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export default async function PostFooter({ categories, excludeSlug }: PostFooterProps) {
  const firstCat = categories?.[0]
  const parentSlug = firstCat?.parent?.node?.slug
  const isVoyage = parentSlug === 'voyages' || firstCat?.slug === 'voyages'

  const categorySlug = isVoyage
    ? firstCat?.slug
    : parentSlug ?? firstCat?.slug

  const rawPosts = categorySlug
    ? await getPostsByCategory(categorySlug, 20)
    : await getRecentPosts(20)

  let posts = rawPosts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    featuredImage: p.featuredImage,
    optionsArticles: p.optionsArticles
  }))

  if (excludeSlug) {
    posts = posts.filter((post) => post.slug !== excludeSlug)
  }

  if (!isVoyage) {
    posts = shuffle(posts)
  }

  if (!posts.length) {
    return null
  }

  return <PostFooterClient posts={posts} isVoyage={isVoyage} />
}
