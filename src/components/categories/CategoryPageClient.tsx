'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import clsx from 'clsx'
import EditorialPostGrid from '@/components/listing/EditorialPostGrid'
import type { Article, CategoryNode, FiltreNode } from '@/types/wordpress'

interface CategoryPageClientProps {
  slug: string
  categoryName?: string
  categoryPunchline?: string | null
  initialPosts: Article[]
  initialCursor?: string | null
  hasNextPage: boolean
  subcategories: CategoryNode[]
  localisations?: CategoryNode[]
  filtres?: FiltreNode[]
}

export default function CategoryPageClient({
  slug,
  categoryName,
  categoryPunchline,
  initialPosts,
  initialCursor,
  hasNextPage,
  subcategories,
  localisations,
  filtres
}: CategoryPageClientProps) {
  const [posts, setPosts] = useState(() => initialPosts)
  const [cursor, setCursor] = useState<string | null | undefined>(initialCursor)
  const [loading, setLoading] = useState(false)
  const [canLoadMore, setCanLoadMore] = useState(hasNextPage)
  const [activeLocalisation, setActiveLocalisation] = useState<string | null>(null)
  const [activeFiltres, setActiveFiltres] = useState<string[]>([])
  const [filtersLoading, setFiltersLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const buildApiUrl = useCallback(
    (extraParams?: Record<string, string>) => {
      const params = new URLSearchParams({ limit: '10', ...extraParams })

      if (activeLocalisation) {
        params.set('localisation', activeLocalisation)
      }

      activeFiltres.forEach((filtreSlug) => {
        params.append('filtre', filtreSlug)
      })

      return `/api/categories/${slug}/posts?${params.toString()}`
    },
    [activeFiltres, activeLocalisation, slug]
  )

  const fetchMore = useCallback(async () => {
    if (!canLoadMore || loading || filtersLoading || !cursor) {
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
  }, [buildApiUrl, canLoadMore, cursor, filtersLoading, loading])

  const loadFilteredPosts = useCallback(
    async (nextLocalisation: string | null, nextFiltres: string[]) => {
      setFiltersLoading(true)

      try {
        const params = new URLSearchParams({ limit: '12' })
        if (nextLocalisation) {
          params.set('localisation', nextLocalisation)
        }
        nextFiltres.forEach((filtreSlug) => params.append('filtre', filtreSlug))

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
        setFiltersLoading(false)
      }
    },
    [slug]
  )

  const handleLocalisationClick = useCallback(
    async (locSlug: string) => {
      const normalizedSlug = locSlug.trim()
      const nextSlug = !normalizedSlug || normalizedSlug === activeLocalisation ? null : normalizedSlug

      setActiveLocalisation(nextSlug)
      await loadFilteredPosts(nextSlug, activeFiltres)
    },
    [activeFiltres, activeLocalisation, loadFilteredPosts]
  )

  const handleFiltreClick = useCallback(
    async (filtreSlug: string) => {
      const normalizedSlug = filtreSlug.trim()
      if (!normalizedSlug) {
        return
      }

      const nextFiltres = activeFiltres.includes(normalizedSlug)
        ? activeFiltres.filter((slug) => slug !== normalizedSlug)
        : [...activeFiltres, normalizedSlug]

      setActiveFiltres(nextFiltres)
      await loadFilteredPosts(activeLocalisation, nextFiltres)
    },
    [activeFiltres, activeLocalisation, loadFilteredPosts]
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

  const filtreList = useMemo(() => {
    if (!filtres?.length) {
      return []
    }

    return filtres.filter((filtre): filtre is FiltreNode & { pictoUrl: string } => Boolean(filtre.slug && filtre.pictoUrl))
  }, [filtres])

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
                    onClick={() => void handleLocalisationClick(loc.slug)}
                    disabled={filtersLoading}
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
                disabled={filtersLoading}
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

        {filtreList.length > 0 ? (
          <div className="mx-auto mb-4 w-full md:mb-8">
            <ul className="flex flex-wrap items-start justify-center gap-0 mb-2 md:mb-0">
              {filtreList.map((filtre) => {
                const isActive = activeFiltres.includes(filtre.slug)

                return (
                  <li key={filtre.slug}>
                    <button
                      type="button"
                      onClick={() => void handleFiltreClick(filtre.slug)}
                      disabled={filtersLoading}
                      aria-pressed={isActive}
                      aria-label={filtre.name ?? filtre.slug}
                      title={filtre.name ?? filtre.slug}
                      className={clsx(
                        'group inline-flex w-[86px] flex-col items-center justify-start gap-2 px-2 py-2 text-center transition-colors duration-300 disabled:opacity-50 md:w-[96px]',
                        isActive && ''
                      )}
                    >
                      <span className="relative h-10 w-10 md:h-8 md:w-8">
                        <Image
                          src={filtre.pictoUrl}
                          alt=""
                          aria-hidden="true"
                          width={40}
                          height={40}
                          unoptimized
                          className={clsx(
                            'absolute inset-0 h-full w-full object-contain transition-opacity duration-200',
                            filtre.pictoHoverUrl
                              ? isActive
                                ? 'opacity-0'
                                : 'opacity-100 group-hover:opacity-0'
                              : 'opacity-100'
                          )}
                        />
                        {filtre.pictoHoverUrl ? (
                          <Image
                            src={filtre.pictoHoverUrl}
                            alt=""
                            aria-hidden="true"
                            width={40}
                            height={40}
                            unoptimized
                            className={clsx(
                              'absolute inset-0 h-full w-full object-contain transition-opacity duration-200',
                              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            )}
                          />
                        ) : null}
                      </span>
                      <span className={clsx('font-montserrat text-[9px] uppercase tracking-[0.16em] leading-tight group-hover:font-bold', 
                              isActive && 'font-bold'
                            )}>
                        {filtre.name ?? filtre.slug}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        <EditorialPostGrid
          posts={posts}
          emptyMessage="Aucun article pour cette catégorie."
          revealKey={`${slug}:${activeLocalisation ?? 'all'}:${activeFiltres.join(',') || 'all'}`}
        />

        <div ref={sentinelRef} className="h-10" />
        {loading || filtersLoading ? (
          <p className="mt-4 text-center font-montserrat text-[10px] uppercase tracking-[0.24em] text-black/60">
            Chargement...
          </p>
        ) : null}
      </div>
    </div>
  )
}
