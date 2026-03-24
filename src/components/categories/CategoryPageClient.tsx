'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import EditorialPostGrid from '@/components/listing/EditorialPostGrid'
import type { Article, CategoryNode } from '@/types/wordpress'

interface CategoryPageClientProps {
  slug: string
  categoryName?: string
  categoryPunchline?: string | null
  initialPosts: Article[]
  initialCursor?: string | null
  hasNextPage: boolean
  subcategories: CategoryNode[]
  localisations?: CategoryNode[]
}

export default function CategoryPageClient({
  slug,
  categoryName,
  categoryPunchline,
  initialPosts,
  initialCursor,
  hasNextPage,
  subcategories,
  localisations
}: CategoryPageClientProps) {
  const [posts, setPosts] = useState(() => initialPosts)
  const [cursor, setCursor] = useState<string | null | undefined>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(hasNextPage)
  const [activeLocalisation, setActiveLocalisation] = useState<string | null>(null)
  const [localisationLoading, setLocalisationLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const buildApiUrl = useCallback(
    (extraParams?: Record<string, string>) => {
      const params = new URLSearchParams({ limit: '10', ...extraParams })

      if (activeLocalisation) {
        params.set('localisation', activeLocalisation)
      }

      return `/api/categories/${slug}/posts?${params.toString()}`
    },
    [activeLocalisation, slug]
  )

  const fetchMore = useCallback(async () => {
    if (!canLoadMore || loading || !cursor) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(buildApiUrl({ cursor }))
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
  }, [buildApiUrl, canLoadMore, cursor, loading])

  const handleLocalisationClick = useCallback(
    async (locSlug: string) => {
      const normalizedSlug = locSlug.trim()
      const nextSlug = !normalizedSlug || normalizedSlug === activeLocalisation ? null : normalizedSlug

      setActiveLocalisation(nextSlug)
      setLocalisationLoading(true)

      try {
        const params = new URLSearchParams({ limit: '12' })
        if (nextSlug) {
          params.set('localisation', nextSlug)
        }

        const response = await fetch(`/api/categories/${slug}/posts?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des articles')
        }

        const data = await response.json()
        setPosts(data?.nodes ?? [])
        setCursor(data?.pageInfo?.endCursor ?? null)
        setCanLoadMore(Boolean(data?.pageInfo?.hasNextPage))
      } catch (error) {
        console.error(error)
      } finally {
        setLocalisationLoading(false)
      }
    },
    [activeLocalisation, slug]
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          void fetchMore()
        }
      })
    })

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [fetchMore])

  const subcategoryList = useMemo(() => {
    if (!subcategories?.length) {
      return []
    }

    return subcategories.filter((cat) => {
      const normalizedName = (cat.name ?? '').trim().toLowerCase()
      return (cat.count ?? 0) > 0 && cat.slug !== 'voyages' && normalizedName !== 'tous les voyages'
    })
  }, [subcategories])

  const introLabel = useMemo(() => {
    const punchline = categoryPunchline?.trim()
    if (punchline) {
      return punchline
    }

    if (!categoryName) {
      return 'Guide local'
    }

    return ' '
  }, [categoryName, categoryPunchline])

  return (
    <div className="template-categories">
      <div className="mx-auto max-w-[1120px] px-6 pb-24 pt-32 md:px-10 md:pb-32 md:pt-24">
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

        {localisations && localisations.length > 0 ? (
          <div className="mx-auto mb-14 w-full md:mb-20">
            <ul className="hidden flex-wrap items-center justify-center gap-3 md:flex md:gap-5">
              {localisations.map((loc) => (
                <li key={loc.slug}>
                  <button
                    type="button"
                    onClick={() => handleLocalisationClick(loc.slug)}
                    disabled={localisationLoading}
                    className={clsx(
                      'inline-flex min-w-[124px] items-center justify-center border border-black px-4 py-[0.55rem] font-montserrat text-[10px] uppercase tracking-[0.24em] transition-colors duration-300 hover:bg-black hover:text-white disabled:opacity-50',
                      activeLocalisation === loc.slug && 'bg-black text-white'
                    )}
                  >
                    {loc.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="md:hidden">
              <select
                onChange={(e) => {
                  const value = e.target.value
                  if (value === (activeLocalisation ?? '')) {
                    return
                  }

                  void handleLocalisationClick(value)
                }}
                value={activeLocalisation ?? ''}
                disabled={localisationLoading}
                className="w-full border border-black px-4 py-[0.55rem] font-montserrat text-[10px] uppercase tracking-[0.24em] disabled:opacity-50"
              >
                <option value="">Toutes les localisations</option>
                {localisations.map((loc) => (
                  <option key={loc.slug} value={loc.slug}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : null}

        <EditorialPostGrid
          posts={posts}
          emptyMessage="Aucun article pour cette catégorie."
          revealKey={`${slug}:${activeLocalisation ?? 'all'}`}
        />

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
