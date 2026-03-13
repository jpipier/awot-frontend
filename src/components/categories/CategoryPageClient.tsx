'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Article, CategoryNode } from '@/types/wordpress'
import clsx from 'clsx'

interface CategoryPageClientProps {
  slug: string
  categoryName?: string
  categoryPunchline?: string | null
  initialPosts: Article[]
  initialCursor?: string | null
  hasNextPage: boolean
  subcategories: CategoryNode[]
}

interface GroupedCategoryPosts {
  cards: Array<{ post: Article; index: number }>
  feature: { post: Article; index: number } | null
}

const stripHtml = (value?: string | null) => {
  if (!value) {
    return ''
  }

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const clampText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value
  }
  return `${value.slice(0, maxLength).trimEnd()}...`
}

const getPostLink = (post: Article) => (post.slug ? `/articles/${post.slug}` : '#')

const getPortraitImage = (post: Article) =>
  post.optionsArticles?.imagePortait?.node?.sourceUrl ??
  post.optionsArticles?.imagePortait?.node?.guid ??
  post.featuredImage?.node?.sourceUrl ??
  post.featuredImage?.node?.guid ??
  post.optionsArticles?.imagePaysage?.node?.sourceUrl ??
  post.optionsArticles?.imagePaysage?.node?.guid ??
  ''

const getLandscapeImage = (post: Article) =>
  post.optionsArticles?.imagePaysage?.node?.sourceUrl ??
  post.optionsArticles?.imagePaysage?.node?.guid ??
  post.featuredImage?.node?.sourceUrl ??
  post.featuredImage?.node?.guid ??
  post.optionsArticles?.imagePortait?.node?.sourceUrl ??
  post.optionsArticles?.imagePortait?.node?.guid ??
  ''

const getPostAlt = (post: Article) =>
  post.optionsArticles?.imagePaysage?.node?.altText ??
  post.optionsArticles?.imagePortait?.node?.altText ??
  post.featuredImage?.node?.altText ??
  post.title

const getLocationLabel = (post: Article) =>
  post.optionsArticles?.champsLibrePageAccueil ?? post.categories?.edges?.[0]?.node?.name ?? 'Awot'

export default function CategoryPageClient({
  slug,
  categoryName,
  categoryPunchline,
  initialPosts,
  initialCursor,
  hasNextPage,
  subcategories
}: CategoryPageClientProps) {
  const [posts, setPosts] = useState(() => initialPosts)
  const [cursor, setCursor] = useState<string | null | undefined>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(hasNextPage)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const [visibleItems, setVisibleItems] = useState<Set<number>>(() => new Set<number>())

  const fetchMore = useCallback(async () => {
    if (!canLoadMore || loading || !cursor) {
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '10' })
      if (cursor) {
        params.set('cursor', cursor)
      }
      const response = await fetch(`/api/categories/${slug}/posts?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des articles')
      }
      const data = await response.json()
      setPosts((prev) => [...prev, ...(data?.nodes ?? [])])
      setCursor(data?.pageInfo?.endCursor ?? null)
      setCanLoadMore(Boolean(data?.pageInfo?.hasNextPage))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [canLoadMore, cursor, loading, slug])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fetchMore()
        }
      })
    })

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [fetchMore])

  useEffect(() => {
    setVisibleItems(new Set<number>())
  }, [slug])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute('data-index')
            if (!indexAttr) {
              return
            }
            const index = Number(indexAttr)
            setVisibleItems((prev) => {
              if (prev.has(index)) {
                return prev
              }
              const next = new Set(prev)
              next.add(index)
              return next
            })
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
      }
    )

    itemRefs.current.forEach((node) => {
      if (node) {
        observer.observe(node)
      }
    })

    return () => observer.disconnect()
  }, [posts])

  const subcategoryList = useMemo(() => {
    if (!subcategories?.length) {
      return []
    }
    return subcategories.filter((cat) => {
      const normalizedName = (cat.name ?? '').trim().toLowerCase()
      return (cat.count ?? 0) > 0 && cat.slug !== 'voyages' && normalizedName !== 'tous les voyages'
    })
  }, [subcategories])

  const groupedPosts = useMemo<GroupedCategoryPosts[]>(() => {
    const groups: GroupedCategoryPosts[] = []

    for (let start = 0; start < posts.length; start += 4) {
      const chunk = posts.slice(start, start + 4)
      groups.push({
        cards: chunk.slice(0, 3).map((post, offset) => ({ post, index: start + offset })),
        feature: chunk[3] ? { post: chunk[3], index: start + 3 } : null
      })
    }

    return groups
  }, [posts])

  const revealClasses = useCallback(
    (index: number) =>
      clsx(
        'transform transition-all duration-1000 ease-out',
        visibleItems.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      ),
    [visibleItems]
  )

  const introLabel = useMemo(() => {
    const punchline = categoryPunchline?.trim()
    if (punchline) {
      return punchline
    }

    if (!categoryName) {
      return 'Guide local'
    }
    return ` `
  }, [categoryName, categoryPunchline])

  const renderImageCaption = useCallback((post: Article) => {
    const locationLabel = getLocationLabel(post)

    return (
      <>
        <div className="mt-3">
          <p className="mb-0 text-[0.5vw] uppercase font-montserrat italic text-gray-600">
            {locationLabel}
          </p>
          <h2 className="text-[3vw] md:text-xs uppercase font-brandonRegular font-medium ">{post.title}</h2>
        </div>
      </>
    )
  }, [])

  return (
    <div className="template-categories">
      <div className="mx-auto max-w-[1120px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
        <header className="mb-14 text-center md:mb-20">
          <h1 className="font-schnyder_wide_xl_webdemi text-[14vw] leading-[0.95] md:text-[86px]">
            {categoryName}
          </h1>
          <div className="mx-auto mt-4 h-px w-32 bg-black/40" />
          <p className="mt-4 font-montserrat text-[10px] uppercase tracking-[0.35em] text-black/70">
            {introLabel}
          </p>
        </header>

        {subcategoryList.length > 0 ? (
          <div className="mx-auto mb-14 w-full md:mb-20">
            <ul className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
              {subcategoryList.map((child) => (
                <li key={child.slug}>
                  <Link
                    href={`/categories/${child.slug}`}
                    className={clsx(
                      'inline-flex min-w-[124px] items-center justify-center border border-black px-4 py-[0.55rem] font-montserrat text-[10px] uppercase tracking-[0.24em] transition-colors duration-300 hover:bg-black hover:text-white',
                      child.slug === slug && 'bg-black text-white'
                    )}
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {groupedPosts.length > 0 ? (
          <div className="space-y-12 md:space-y-14">
            {groupedPosts.map((group, groupIndex) => {
              const featureOnLeft = groupIndex % 2 === 0
              return (
                <section key={`group-${groupIndex}`} className="space-y-8 md:space-y-10 -mb-[16px]">
                  {group.cards.length ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-7">
                      {group.cards.map(({ post, index }) => {
                        const imageSrc = getPortraitImage(post)
                        const altText = getPostAlt(post)

                        return (
                          <article
                            key={`${post.slug ?? index}-card`}
                            ref={(el) => {
                              itemRefs.current[index] = el
                            }}
                            data-index={index}
                            className={revealClasses(index)}
                            style={{ transitionDelay: `${(index % 4) * 140}ms` }}
                          >
                            <Link href={getPostLink(post)} className="group block">
                              {imageSrc ? (
                                <div className="relative aspect-[3/4] overflow-hidden bg-black/5">
                                  <Image
                                    src={imageSrc}
                                    alt={altText}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.045]"
                                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                  />
                                </div>
                              ) : null}
                              {renderImageCaption(post)}
                            </Link>
                          </article>
                        )
                      })}
                    </div>
                  ) : null}

                  {group.feature ? (
                    <article
                      ref={(el) => {
                        if (group.feature) itemRefs.current[group.feature.index] = el
                      }}
                      data-index={group.feature.index}
                      className={clsx(
                        revealClasses(group.feature.index),
                        'grid gap-7 md:items-end md:gap-8',
                        featureOnLeft
                          ? 'md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]'
                          : 'md:grid-cols-[minmax(260px,1fr)_minmax(0,2fr)]'
                      )}
                      style={{ transitionDelay: `${(group.feature.index % 4) * 140}ms` }}
                    >
                      {featureOnLeft ? (
                        <>
                          <Link
                            href={getPostLink(group.feature.post)}
                            className="group block"
                          >
                            <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
                              {getLandscapeImage(group.feature.post) ? (
                                <Image
                                  src={getLandscapeImage(group.feature.post)}
                                  alt={getPostAlt(group.feature.post)}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                  sizes="(min-width: 1024px) 66vw, 100vw"
                                />
                              ) : null}
                            </div>
                            {renderImageCaption(group.feature.post)}
                          </Link>
                          <div className="pt-1 md:pl-2 mb-[48px]">
                            <p className="font-montserrat text-[10px] uppercase tracking-[0.24em] text-black/70">
                              {group.feature.post.optionsArticles?.champsLibrePageAccueil ?? 'Bonnes adresses'}
                            </p>
                            <h2 className="mt-2 font-brandonRegular text-[24px] uppercase leading-tight">
                              {group.feature.post.title}
                            </h2>
                            <p className="mt-5 max-w-[36ch] font-montserrat text-[13px] leading-relaxed text-black/80">
                              {clampText(stripHtml(group.feature.post.excerpt), 300)}
                            </p>
                            <Link
                              href={getPostLink(group.feature.post)}
                              className="mt-6 inline-flex items-center justify-center bg-black px-5 py-[0.7rem] font-montserrat text-[10px] uppercase tracking-[0.24em] text-white transition-colors duration-300 hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
                            >
                              Lire la suite
                            </Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="pt-1 md:pr-2 mb-[48px]">
                            <p className="font-montserrat text-[10px] uppercase tracking-[0.24em] text-black/70">
                              {group.feature.post.optionsArticles?.champsLibrePageAccueil ?? 'Bonnes adresses'}
                            </p>
                            <h2 className="mt-2 font-brandonRegular text-[24px] uppercase leading-tight">
                              {group.feature.post.title}
                            </h2>
                            <p className="mt-5 max-w-[36ch] font-montserrat text-[13px] leading-relaxed text-black/80">
                              {clampText(stripHtml(group.feature.post.excerpt), 300)}
                            </p>
                            <Link
                              href={getPostLink(group.feature.post)}
                              className="mt-6 inline-flex items-center justify-center bg-black px-5 py-[0.7rem] font-montserrat text-[10px] uppercase tracking-[0.24em] text-white transition-colors duration-300 hover:bg-white hover:text-black hover:ring-1 hover:ring-black"
                            >
                              Lire la suite
                            </Link>
                          </div>
                          <Link
                            href={getPostLink(group.feature.post)}
                            className="group block"
                          >
                            <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
                              {getLandscapeImage(group.feature.post) ? (
                                <Image
                                  src={getLandscapeImage(group.feature.post)}
                                  alt={getPostAlt(group.feature.post)}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                  sizes="(min-width: 1024px) 66vw, 100vw"
                                />
                              ) : null}
                            </div>
                            {renderImageCaption(group.feature.post)}
                          </Link>
                        </>
                      )}
                    </article>
                  ) : null}
                </section>
              )
            })}
          </div>
        ) : (
          <p className="text-center font-montserrat text-sm uppercase tracking-[0.2em] text-black/70">
            Aucun article pour cette catégorie.
          </p>
        )}

        <div ref={sentinelRef} className="h-10" />
        {loading ? (
          <p className="mt-4 text-center font-montserrat text-[10px] uppercase tracking-[0.24em] text-black/60">
            Chargement...
          </p>
        ) : null}
      </div>
    </div>
  )
}
