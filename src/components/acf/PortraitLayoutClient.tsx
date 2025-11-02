'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import type { Article } from '@/types/wordpress'

import 'swiper/css'
import 'swiper/css/navigation'

interface PortraitLayoutClientProps {
  posts: Article[]
  titreDeLaSection: string
  contenu: string
}

function buildCategoryLabel(post?: Article) {
  const edges = post?.categories?.edges ?? []
  if (!edges.length) {
    return null
  }
  const childEdge = edges.find((edge) => edge.node.parent?.node)
  const target = childEdge ?? edges[0]
  if (!target?.node?.name) {
    return null
  }
  const parentName = target.node.parent?.node?.name
  return parentName ? `${target.node.name} | ${parentName}` : target.node.name
}

export default function PortraitLayoutClient({ posts, titreDeLaSection, contenu }: PortraitLayoutClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsVisible(entry.isIntersecting)
      })
    }, { threshold: 0.5 })

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const slides = useMemo(() => posts, [posts])
  const activePost = useMemo(() => slides[currentIndex] ?? slides[0], [slides, currentIndex])
  const categoryLabel = useMemo(() => buildCategoryLabel(activePost) ?? '', [activePost])
  const excerpt = activePost?.excerpt ?? activePost?.optionsArticles?.champsLibrePageAccueil ?? ''
  const excerptLines = useMemo(() => {
    if (!excerpt) {
      return []
    }
    return excerpt
      .split('<br>')
      .join('\n')
      .split(/\r?\n/)
      .flatMap((line) => (line.trim() ? line.trim().split(/<\/?p>/).filter(Boolean) : []))
      .map((line) => line.replace(/<\/?[^>]+(>|$)/g, '').trim())
      .filter(Boolean)
  }, [excerpt])
  const ANIMATION_STEP = 0.18
  const categoryDelay = ANIMATION_STEP
  const titleDelay = ANIMATION_STEP * 2
  const excerptBaseDelay = ANIMATION_STEP * 3
  const ctaDelay = excerptBaseDelay + ANIMATION_STEP * excerptLines.length

  if (!slides.length) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        'bloc-portrait relative pb-20 pt-20 lg:pb-24',
        'mb-40 transition-colors duration-500 lg:mb-0 bg-white'
      )}
    >
      <div className="mx-auto flex w-full flex-col gap-12 lg:flex-row lg:items-center">
        <div
          className="order-1 flex w-full flex-col justify-center lg:w-1/2"
          style={{ marginLeft: 'calc((100vw - 100%) / -2)' }}
        >
          <Swiper
            dir="rtl"
            modules={[Navigation]}
            slidesPerView={1.2}
            spaceBetween={16}
            loop={true}
            navigation={{ prevEl: '.swiper-button-prev-portrait', nextEl: '.swiper-button-next-portrait' }}
            breakpoints={{
              640: { slidesPerView: 1.2, spaceBetween: 18 },
              768: { slidesPerView: 1.2, spaceBetween: 20 },
              1024: { slidesPerView: 1.2, spaceBetween: 20 }
            }}
            onSlideChange={(swiper) => {
              const nextIndex = typeof swiper.realIndex === 'number' ? swiper.realIndex : swiper.activeIndex
              setCurrentIndex(nextIndex ?? 0)
            }}
            className="portrait-slider w-full"
          >
            {slides.map((post, index) => {
              const imageNode =
                post.optionsArticles?.imagePaysage?.node ??
                post.optionsArticles?.imagePortait?.node ??
                post.featuredImage?.node
              const imageSrc = imageNode?.sourceUrl ?? imageNode?.guid ?? null
              const isActive = currentIndex === index
              const postHref = post.slug ? `/articles/${post.slug}` : '#'

              return (
                <SwiperSlide key={post.slug ?? index} className="relative">
                  <Link href={postHref} className="block">
                    {imageSrc ? (
                      <div
                        className={clsx(
                          'relative w-full min-w-[260px] rounded overflow-hidden transition-transform duration-500',
                          'h-[220px] sm:h-[260px] md:h-[300px] lg:h-[340px] xl:h-[380px]',
                          isActive ? 'scale-100' : 'scale-[0.95] opacity-80'
                        )}
                      >
                        <Image
                          src={imageSrc}
                          alt={imageNode?.altText ?? post.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1280px) 45vw, (min-width: 768px) 60vw, 100vw"
                          unoptimized
                        />
                      </div>
                    ) : null}
                  </Link>
                </SwiperSlide>
              )
            })}
          </Swiper>
          {/* <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.2em]">
            <button type="button" className="swiper-button-prev-portrait flex items-center gap-2">
              ← Précédent
            </button>
            <button type="button" className="swiper-button-next-portrait flex items-center gap-2">
              Suivant →
            </button>
          </div> */}
        </div>
        <div
          className={clsx(
            'order-2 flex w-full flex-col justify-center lg:w-1/2 text-black'
          )}
        >
          <div className="flex flex-col gap-10 overflow-hidden">
            <h2 className="text-[3rem] font-schnyder_wide_xl_webdemi leading-[0.95] lg:text-[4.5rem]">
              {titreDeLaSection}
            </h2>
            <div key={activePost?.slug ?? currentIndex} className="flex flex-col gap-4 text-current">
              {categoryLabel ? (
                <span
                  key={`category-${activePost?.slug ?? currentIndex}`}
                  className="font-brandon_grotesquelight_italic text-xs uppercase tracking-[0.3em] -mb-4 opacity-70 line-fade-in"
                  style={{ animationDelay: `${categoryDelay}s` }}
                >
                  {categoryLabel}
                </span>
              ) : null}
              <Link
                key={`title-${activePost?.slug ?? currentIndex}`}
                href={activePost?.slug ? `/articles/${activePost.slug}` : '#'}
                className="group"
              >
                <h3
                  className="font-schnyder_xl_webdemi text-[2.5rem] leading-tight transition duration-300 group-hover:opacity-70 line-fade-in"
                  style={{ animationDelay: `${titleDelay}s` }}
                >
                  {activePost?.title}
                </h3>
              </Link>
              {excerptLines.length
                ? excerptLines.map((line, idx) => (
                    <p
                      key={`${activePost?.slug ?? currentIndex}-line-${idx}`}
                      className="lato-light text-sm leading-relaxed opacity-80 line-fade-in"
                      style={{ animationDelay: `${excerptBaseDelay + ANIMATION_STEP * idx}s` }}
                    >
                      {line}
                    </p>
                  ))
                : null}
              <Link
                key={`cta-${activePost?.slug ?? currentIndex}`}
                href={activePost?.slug ? `/articles/${activePost.slug}` : '#'}
                className="text-xs uppercase tracking-[0.2em] text-current line-fade-in"
                style={{ animationDelay: `${ctaDelay}s` }}
              >
                Découvrir <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .swiper-button-next-portrait,
        .swiper-button-prev-portrait {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
          letter-spacing: 0.2em;
        }
        .swiper-button-next-portrait:after,
        .swiper-button-prev-portrait:after {
          display: none;
        }
        .portrait-slider .swiper-wrapper {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-content: flex-end;
        }
        .portrait-slider {
          overflow: visible;
        }
        .line-fade-in {
          opacity: 0;
          transform: translateY(-16px);
          animation: lineFadeDown 0.45s ease forwards;
        }
        @keyframes lineFadeDown {
          0% {
            opacity: 0;
            transform: translateY(-16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
