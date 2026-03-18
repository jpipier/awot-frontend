'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import type { Article } from '@/types/wordpress'
import {
  getArticleAlt,
  getArticleLandscapeImage,
  getArticleLocationLabel,
  getArticlePortraitImage
} from '@/lib/article-card'

interface EditorialPostGridProps {
  posts: Article[]
  emptyMessage: string
  revealKey?: string
}

interface GroupedPosts {
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

export default function EditorialPostGrid({ posts, emptyMessage, revealKey }: EditorialPostGridProps) {
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const [visibleItems, setVisibleItems] = useState<Set<number>>(() => new Set<number>())

  useEffect(() => {
    setVisibleItems(new Set<number>())
  }, [revealKey])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

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
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
      }
    )

    const nodes = itemRefs.current.slice(0, posts.length)
    nodes.forEach((node) => {
      if (node) {
        observer.observe(node)
      }
    })

    return () => observer.disconnect()
  }, [posts])

  const groupedPosts = useMemo<GroupedPosts[]>(() => {
    const groups: GroupedPosts[] = []

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

  const renderImageCaption = useCallback((post: Article) => {
    const locationLabel = getArticleLocationLabel(post)

    return (
      <div className="mt-3">
        {locationLabel ? (
          <p className="mb-0 text-xs md:text-[0.5vw] uppercase font-montserrat italic text-gray-600">
            {locationLabel}
          </p>
        ) : null}
        <h2 className="text-[3vw] md:text-xs uppercase font-brandonRegular font-medium">{post.title}</h2>
      </div>
    )
  }, [])

  if (!groupedPosts.length) {
    return (
      <p className="text-center font-montserrat text-sm uppercase tracking-[0.2em] text-black/70">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="space-y-12 md:space-y-14">
      {groupedPosts.map((group, groupIndex) => {
        const featureOnLeft = groupIndex % 2 === 0

        return (
          <section key={`group-${groupIndex}`} className="space-y-8 md:space-y-10 -mb-[16px]">
            {group.cards.length ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-7">
                {group.cards.map(({ post, index }) => {
                  const imageSrc = getArticlePortraitImage(post)
                  const altText = getArticleAlt(post)

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
                  if (group.feature) {
                    itemRefs.current[group.feature.index] = el
                  }
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
                    <Link href={getPostLink(group.feature.post)} className="group block">
                      <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
                        {getArticleLandscapeImage(group.feature.post) ? (
                          <Image
                            src={getArticleLandscapeImage(group.feature.post)}
                            alt={getArticleAlt(group.feature.post)}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(min-width: 1024px) 66vw, 100vw"
                          />
                        ) : null}
                      </div>
                      {renderImageCaption(group.feature.post)}
                    </Link>
                    <div className="mb-[48px] pt-1 md:pl-2">
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
                    <div className="mb-[48px] pt-1 md:pr-2">
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
                    <Link href={getPostLink(group.feature.post)} className="group block">
                      <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
                        {getArticleLandscapeImage(group.feature.post) ? (
                          <Image
                            src={getArticleLandscapeImage(group.feature.post)}
                            alt={getArticleAlt(group.feature.post)}
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
  )
}
