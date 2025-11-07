'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import he from 'he'
import type { Article } from '@/types/wordpress'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface GuideVoyageLayoutClientProps {
  posts: Article[]
  categorySlug?: string
}

const STAGGER_DELAY_MS = 80
const BASE_DELAY_MS = 120

function AnimatedCarouselItem({
  children,
  className,
  delay = 0,
  forceVisible = false
}: {
  children: ReactNode
  className?: string
  delay?: number
  forceVisible?: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const next = entry.isIntersecting
        setIsVisible((prev) => (prev === next ? prev : next))
      },
      { threshold: 0.3 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const effectiveVisible = forceVisible || isVisible
  const stateClass = effectiveVisible ? 'carousel-animated-item--visible' : 'carousel-animated-item--hidden'
  const combinedClassName = ['carousel-animated-item', stateClass, className].filter(Boolean).join(' ')
  const style: CSSProperties | undefined = effectiveVisible
    ? { transitionDelay: `${Math.max(delay, 0)}ms` }
    : undefined

  return (
    <div ref={containerRef} className={combinedClassName} style={style}>
      {children}
    </div>
  )
}

export default function GuideVoyageLayoutClient({ posts, categorySlug }: GuideVoyageLayoutClientProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperContainerRef = useRef<HTMLDivElement | null>(null)
  const [isCarouselVisible, setIsCarouselVisible] = useState(false)

  const sanitizedPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        excerptPlain: he
          .decode(post.excerpt ?? '')
          .replace(/<[^>]*>/g, '')
          .trim()
      })),
    [posts]
  )

  const current = sanitizedPosts[activeIndex] ?? sanitizedPosts[0]

  const categoryUrl = categorySlug ? `/categories/${categorySlug}` : null

  useEffect(() => {
    const element = swiperContainerRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCarouselVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="mt-10 flex flex-col items-start gap-10 lg:flex-row">
      <div className="flex w-full flex-col gap-4 self-end pb-16 text-left px-6 sm:px-10 md:px-16 lg:w-2/5 lg:pl-[8rem] lg:pr-16">
        <h2 className="text-2xl font-montserrat font-medium uppercase leading-tight">{current?.title}</h2>
        {current?.optionsArticles?.champsLibrePageAccueil ? (
          <h3 className="text-lg text-gray-600 italic font-montserrat italic">
            {current.optionsArticles.champsLibrePageAccueil}
          </h3>
        ) : null}
        <p className="text-sm font-light font-montserrat">{current?.excerptPlain}</p>
        {current?.slug ? (
          <Link
            href={`/articles/${current.slug}`}
            className="mt-4 inline-block bg-black px-4 py-2 text-sm uppercase text-white w-fit"
          >
            Lire la suite
          </Link>
        ) : null}
      </div>
      <div ref={swiperContainerRef} className="w-full overflow-hidden lg:w-3/5 lg:pl-0">
        <Swiper
          modules={[Navigation, Pagination]}
          className="mySwiper"
          slidesPerView={1.2}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 2.5, spaceBetween: 20 }
          }}
          onSlideChange={({ activeIndex: index }) => {
            const clampedIndex = Math.min(index ?? 0, Math.max(sanitizedPosts.length - 1, 0))
            setActiveIndex(clampedIndex)
          }}
        >
          {sanitizedPosts.map((post, index) => {
            const itemDelay = BASE_DELAY_MS + index * STAGGER_DELAY_MS
            return (
              <SwiperSlide key={post.slug} className="carousel-item">
                <AnimatedCarouselItem className="group relative" delay={itemDelay} forceVisible={isCarouselVisible}>
                  <Link href={`/articles/${post.slug}`}
                    className="block">
                    {post.optionsArticles?.imagePortait?.node?.guid ? (
                      <div className="relative w-full overflow-hidden h-[320px] md:h-[420px] lg:h-[480px] 3xl:h-[540px]">
                        <Image
                          src={post.optionsArticles.imagePortait.node.guid}
                          alt={post.title}
                          fill
                          className="rounded-md object-cover shadow-md transition-transform duration-300 group-hover:scale-110"
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div className="mt-3">
                      <p className="mb-1 text-[12px] uppercase font-montserrat italic" dangerouslySetInnerHTML={{ __html: post.optionsArticles?.champsLibrePageAccueil ?? '' }} />
                      <h3 className="mt-2 text-left text-[15px] uppercase font-montserrat font-medium">{post.title}</h3>
                    </div>
                  </Link>
                </AnimatedCarouselItem>
              </SwiperSlide>
            )
          })}
          {categoryUrl ? (
            <SwiperSlide key="view-all" className="carousel-item">
              <AnimatedCarouselItem
                delay={BASE_DELAY_MS + sanitizedPosts.length * STAGGER_DELAY_MS}
                forceVisible={isCarouselVisible}
              >
                <Link
                  href={categoryUrl}
                  className="block h-full w-full"
                >
                  <div className="relative w-full overflow-hidden h-[320px] md:h-[420px] lg:h-[480px] 3xl:h-[540px]">
                    <div className="flex h-full w-full items-center justify-center rounded-md border border-black bg-black text-white transition-colors duration-300 hover:bg-white hover:text-black">
                      <span className="font-montserrat text-xs uppercase tracking-[0.3em]">
                        Découvrir tous
                      </span>
                    </div>
                  </div>
                </Link>
              </AnimatedCarouselItem>
            </SwiperSlide>
          ) : null}
        </Swiper>
      </div>
      <style jsx global>{`
        .carousel-animated-item {
          will-change: transform, opacity;
          transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease-out;
        }
        .carousel-animated-item--hidden {
          opacity: 0;
          transform: translateX(24px);
          transition-delay: 0ms !important;
        }
        .carousel-animated-item--visible {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </div>
  )
}
