import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/footer/Footer'
import { getCategoryChildrenBySlug } from '@/lib/categories'
import {
  getArticleAlt,
  getArticlePortraitImage
} from '@/lib/article-card'
import { getPostsByCategory } from '@/lib/posts'
import { sanitizeExcerptText } from '@/lib/sanitize-excerpt-text'
import { sanitizePostTitleHtml } from '@/lib/sanitize-post-title-html'

const SUGGESTED_POSTS_COUNT = 9
const SUGGESTED_POSTS_POOL_SIZE = 36
const SUGGESTED_POSTS_CATEGORY_SLUG = 'guide-pays-basque-l-landes'
const MIN_POSTS_PER_CATEGORY = 12

type CategoryPost = Awaited<ReturnType<typeof getPostsByCategory>>[number]
type SuggestedPost = CategoryPost & { id: string; slug: string }

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: 'La page demandee est introuvable. Continuez votre visite avec nos derniers articles.',
  robots: {
    index: false,
    follow: true
  }
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[randomIndex]] = [result[randomIndex], result[i]]
  }
  return result
}

function clampText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trimEnd()}...`
}

function getTaxonomyLabel(post: SuggestedPost) {
  const localisationEdges = post.localisations?.edges ?? []
  const categoryEdges = post.categories?.edges ?? []

  const localisationNode =
    localisationEdges.find((edge) => edge.node?.parent?.node)?.node ?? localisationEdges[0]?.node
  const categoryNode =
    categoryEdges.find((edge) => edge.node?.parent?.node)?.node ?? categoryEdges[0]?.node

  const localisation = localisationNode?.name?.trim() ?? ''
  const category = categoryNode?.name?.trim() ?? ''

  if (localisation && category) {
    return `${localisation} - ${category}`
  }

  return localisation || category
}

function isSuggestedPost(post: CategoryPost): post is SuggestedPost {
  return (
    typeof post.id === 'string' &&
    post.id.trim().length > 0 &&
    typeof post.slug === 'string' &&
    post.slug.trim().length > 0
  )
}

async function getSuggestedPosts(): Promise<SuggestedPost[]> {
  try {
    let childSlugs: string[] = []

    try {
      const category = await getCategoryChildrenBySlug(SUGGESTED_POSTS_CATEGORY_SLUG)
      childSlugs =
        category?.children?.nodes
          ?.map((node) => node.slug?.trim() ?? '')
          .filter((slug) => slug.length > 0) ?? []
    } catch (error) {
      console.warn('Unable to load category children for 404 page', error)
    }

    const categorySlugs = Array.from(
      new Set([SUGGESTED_POSTS_CATEGORY_SLUG, ...childSlugs])
    )

    const postsPerCategory = Math.max(
      MIN_POSTS_PER_CATEGORY,
      Math.ceil(SUGGESTED_POSTS_POOL_SIZE / categorySlugs.length)
    )

    const postGroups = await Promise.all(
      categorySlugs.map((slug) => getPostsByCategory(slug, postsPerCategory))
    )

    const uniquePosts = new Map<string, SuggestedPost>()
    for (const post of postGroups.flat()) {
      if (!isSuggestedPost(post)) {
        continue
      }

      uniquePosts.set(post.id, post)
    }

    return shuffle(Array.from(uniquePosts.values())).slice(0, SUGGESTED_POSTS_COUNT)
  } catch (error) {
    console.error('Unable to load suggested posts for 404 page', error)
    return []
  }
}

export default async function NotFound() {
  const suggestedPosts = await getSuggestedPosts()

  return (
    <div className="template-categories">
      <div className="mx-auto max-w-[1120px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
        <header className="mb-14 text-center md:mb-20">
          <p className="font-montserrat text-[10px] uppercase tracking-[0.35em] text-black/70">Erreur 404</p>
          <h1 className="mt-2 font-schnyder_wide_xl_webdemi text-[14vw] leading-[0.95] md:text-[86px]">
            Page introuvable
          </h1>
          <div className="mx-auto mt-4 h-px w-32 bg-black/40" />
          <p className="mx-auto mt-4 max-w-[60ch] font-montserrat text-[10px] uppercase tracking-[0.2em] text-black/70 md:text-[11px]">
            Cette URL n&apos;existe pas ou n&apos;est plus disponible.
          </p>

          <nav aria-label="Navigation utile depuis la page 404" className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-5">
            <Link
              href="/"
              className="inline-flex min-w-[124px] items-center justify-center border border-black bg-black px-4 py-[0.55rem] font-montserrat text-[10px] uppercase tracking-[0.24em] text-white transition-colors duration-300 hover:bg-white hover:text-black"
            >
              Accueil
            </Link>
            <Link
              href="/recherche"
              className="inline-flex min-w-[124px] items-center justify-center border border-black px-4 py-[0.55rem] font-montserrat text-[10px] uppercase tracking-[0.24em] transition-colors duration-300 hover:bg-black hover:text-white"
            >
              Recherche
            </Link>
            {/* <Link
              href="/contact"
              className="inline-flex min-w-[124px] items-center justify-center border border-black px-4 py-[0.55rem] font-montserrat text-[10px] uppercase tracking-[0.24em] transition-colors duration-300 hover:bg-black hover:text-white"
            >
              Contact
            </Link> */}
          </nav>
        </header>

        <section aria-labelledby="not-found-suggestions-title">
          <h2
            id="not-found-suggestions-title"
            className="mb-8 text-center font-montserrat text-[10px] uppercase tracking-[0.35em] text-black/70 md:mb-10"
          >
            {`${suggestedPosts.length} article${suggestedPosts.length > 1 ? 's' : ''} pour continuer`}
          </h2>

          {suggestedPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {suggestedPosts.map((post) => {
                const imageSrc = getArticlePortraitImage(post)
                const taxonomyLabel = getTaxonomyLabel(post)
                const excerpt = clampText(sanitizeExcerptText(post.excerpt), 170)

                return (
                  <article key={post.id} className="flex h-full flex-col">
                    <Link href={`/articles/${post.slug}`} className="group block h-full">
                      {imageSrc ? (
                        <div className="relative aspect-[3/4] overflow-hidden bg-black/5">
                          <Image
                            src={imageSrc}
                            alt={getArticleAlt(post)}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.045]"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[3/4] items-center justify-center bg-black/5">
                          <span className="font-montserrat text-[10px] uppercase tracking-[0.24em] text-black/50">
                            Article
                          </span>
                        </div>
                      )}

                      <div className="pt-3 md:pl-2">
                        {taxonomyLabel ? (
                          <p className="mb-0 text-sm md:text-[0.7vw] uppercase font-montserrat italic text-gray-800 md:text-gray-600">
                            {taxonomyLabel}
                          </p>
                        ) : null}
                        <h2
                          className="text-[3vw] md:text-xs uppercase font-brandonRegular font-medium ml-0"
                          dangerouslySetInnerHTML={{ __html: sanitizePostTitleHtml(post.title) }}
                        />
                        <p className="mt-4 max-w-[36ch] font-montserrat text-[13px] leading-relaxed text-black/80">
                          {excerpt || 'Decouvrez cet article de notre guide local.'}
                        </p>
                        <span className="mt-6 inline-flex items-center justify-center bg-black px-5 py-[0.7rem] font-montserrat text-[10px] uppercase tracking-[0.24em] text-white transition-colors duration-300 group-hover:bg-white group-hover:text-black group-hover:ring-1 group-hover:ring-black">
                          Lire la suite
                        </span>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="text-center font-montserrat text-sm uppercase tracking-[0.2em] text-black/70">
              Aucun article recent disponible pour le moment.
            </p>
          )}
        </section>
      </div>

      <Footer />
    </div>
  )
}
