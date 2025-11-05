'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Article, CategoryNode } from '@/types/wordpress'
import clsx from 'clsx'

interface CategoryPageClientProps {
  slug: string
  categoryName?: string
  initialPosts: Article[]
  initialCursor?: string | null
  hasNextPage: boolean
  subcategories: CategoryNode[]
}

export default function CategoryPageClient({
  slug,
  categoryName,
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
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])
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
    return subcategories.filter((cat) => (cat.count ?? 0) > 0)
  }, [subcategories])

  return (
    <div className="container mx-auto py-10 template-categories px-5 md:px-0">
      <h1 className="mb-6 text-center text-6xl font-custom pb-10">{categoryName}</h1>
      {subcategoryList.length > 0 ? (
        <div className="mx-auto mb-8 w-full pb-10 md:w-1/2">
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {subcategoryList.map((child) => (
              <li key={child.slug} className="mb-3">
                <Link
                  href={`/categories/${child.slug}`}
                  className={clsx(
                    'border border-black px-4 py-2 uppercase transition hover:bg-black hover:text-white',
                    child.slug === slug && 'bg-black text-white'
                  )}
                >
                  {child.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/categories/voyages"
                className={clsx(
                  'border border-black px-4 py-2 uppercase transition hover:bg-black hover:text-white',
                  slug === 'voyages' && 'bg-black text-white'
                )}
              >
                Tous les voyages
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
      {posts.length > 0 ? (
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {posts.map((post, index) => {
            const isFeature = (index + 1) % 4 === 0
            const featuredImage =
              post.optionsArticles?.imagePaysage?.node?.sourceUrl ??
              post.featuredImage?.node?.sourceUrl ??
              post.optionsArticles?.imagePortait?.node?.sourceUrl ??
              ''
            const altText =
              post.optionsArticles?.imagePaysage?.node?.altText ??
              post.featuredImage?.node?.altText ??
              post.title

            return (
              <li
                key={`${post.slug}-${index}`}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
                data-index={index}
                className={clsx(
                  'w-full transform transition-all duration-1000 ease-out',
                  visibleItems.has(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                  isFeature ? 'sm:col-span-3' : 'sm:col-span-1'
                )}
                style={{ transitionDelay: `${(index % 4) * 200}ms` }}
              >
                <Link href={`/articles/${post.slug}`} className="group block">
                  {featuredImage ? (
                    <div
                      className={clsx(
                        'overflow-hidden',
                        isFeature ? 'flex flex-col gap-6 sm:flex-row' : ''
                      )}
                      style={isFeature ? { minHeight: '400px' } : undefined}
                    >
                      {isFeature ? (
                        <>
                          <div className="relative max-h-full w-full overflow-hidden sm:w-2/3">
                            <Image
                              src={featuredImage}
                              alt={altText}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                            />
                          </div>
                          <div className="flex w-full flex-col justify-center sm:w-1/3">
                            <div className="text-xs uppercase italic text-gray-500">
                              {post.optionsArticles?.champsLibrePageAccueil}
                            </div>
                            <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
                            <div
                              className="mt-4 text-sm text-gray-700"
                              dangerouslySetInnerHTML={{ __html: post.excerpt ?? '' }}
                            />
                            <span className="mt-4 inline-block rounded bg-black px-4 py-2 text-xs text-white">
                              Lire l’article
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative aspect-[3/4] overflow-hidden">
                            <Image
                              src={featuredImage}
                              alt={altText}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="(min-width: 768px) 30vw, 100vw"
                            />
                          </div>
                          <div className="mt-2 text-xs uppercase italic text-gray-500">
                            {post.optionsArticles?.champsLibrePageAccueil}
                          </div>
                          <h2 className="text-sm font-medium leading-snug">{post.title}</h2>
                        </>
                      )}
                    </div>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <p>Aucun article pour cette catégorie.</p>
      )}
      <div ref={sentinelRef} className="h-10" />
      {loading && <p className="mt-4 text-center text-sm text-gray-500">Chargement...</p>}
    </div>
  )
}
