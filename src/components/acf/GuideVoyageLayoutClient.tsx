'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import he from 'he'
import type { Article } from '@/types/wordpress'
import type { Swiper as SwiperInstance } from 'swiper'
import type { gsap as GSAP } from 'gsap'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

type GSAPTimeline = ReturnType<GSAP['timeline']>
type Tween = ReturnType<GSAP['to']>

interface GuideVoyageLayoutClientProps {
  posts: Article[]
  categorySlug?: string
}

const STAGGER_DELAY_MS = 80
const BASE_DELAY_MS = 240
const STICKY_START_OFFSET_PX = 500
const STICKY_MEDIA_QUERY = '(min-width: 1024px)'
const VOYAGES_SECTION_SELECTOR = '#voyages'
const CAROUSEL_AUTOPLAY_DELAY_MS = 5200
const CAROUSEL_EASE = 'sine.inOut'

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
  const stickyRowRef = useRef<HTMLDivElement | null>(null)
  const swiperInstanceRef = useRef<SwiperInstance | null>(null)
  const indicatorProgressRef = useRef<HTMLDivElement | null>(null)
  const indicatorTimelineRef = useRef<GSAPTimeline | null>(null)
  const backgroundLayerRef = useRef<HTMLDivElement | null>(null)
  const coverRef = useRef<HTMLDivElement | null>(null)
  const parallaxTweenRef = useRef<Tween | null>(null)

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
  const shouldAutoplay = sanitizedPosts.length > 1
  const currentBackgroundImage = current?.optionsArticles?.imagePortait?.node?.guid ?? null
  const paginationDisabled = sanitizedPosts.length <= 1
  const slideNumbersStyle: CSSProperties = {
    transform: `translateY(-${activeIndex * 100}%)`
  }

  const handlePrevSlide = () => {
    indicatorTimelineRef.current?.restart()
    swiperInstanceRef.current?.slidePrev()
  }

  const handleNextSlide = () => {
    indicatorTimelineRef.current?.restart()
    swiperInstanceRef.current?.slideNext()
  }
  const [voyagesSectionNode, setVoyagesSectionNode] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(sanitizedPosts.length - 1, 0)))
  }, [sanitizedPosts.length])

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

  useEffect(() => {
    const detectSection = () => {
      if (!stickyRowRef.current) {
        return null
      }
      return stickyRowRef.current.closest(VOYAGES_SECTION_SELECTOR) as HTMLElement | null
    }

    const section = detectSection()
    setVoyagesSectionNode(section)
  }, [])

  useEffect(() => {
    if (!voyagesSectionNode) {
      return
    }
    voyagesSectionNode.classList.add('guide-voyage-section')
    return () => {
      voyagesSectionNode.classList.remove('guide-voyage-section')
    }
  }, [voyagesSectionNode, currentBackgroundImage])

  useEffect(() => {
    if (!shouldAutoplay || typeof window === 'undefined') {
      indicatorTimelineRef.current?.kill()
      indicatorTimelineRef.current = null
      return
    }

    let isCancelled = false

    const setupIndicator = async () => {
      try {
        const { default: gsap } = await import('gsap')
        if (!indicatorProgressRef.current || isCancelled) {
          return
        }

        indicatorTimelineRef.current?.kill()
        indicatorTimelineRef.current = gsap
          .timeline({ paused: true })
          .fromTo(
            indicatorProgressRef.current,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: CAROUSEL_AUTOPLAY_DELAY_MS / 1000,
              ease: CAROUSEL_EASE
            }
          )
      } catch (error) {
        console.error('Unable to initialize GuideVoyage carousel indicator', error)
      }
    }

    setupIndicator()

    return () => {
      isCancelled = true
      indicatorTimelineRef.current?.kill()
      indicatorTimelineRef.current = null
    }
  }, [shouldAutoplay])

  useEffect(() => {
    if (!shouldAutoplay) {
      return
    }
    indicatorTimelineRef.current?.restart()
  }, [activeIndex, shouldAutoplay])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!currentBackgroundImage) {
      if (backgroundLayerRef.current) {
        backgroundLayerRef.current.style.backgroundImage = ''
      }
      return
    }

    let isCancelled = false
    let gsapInstance: typeof import('gsap')['default'] | null = null

    const animateBackground = async () => {
      try {
        const { default: gsap } = await import('gsap')
        gsapInstance = gsap
        if (!backgroundLayerRef.current || isCancelled) {
          return
        }

        backgroundLayerRef.current.style.backgroundImage = `url(${currentBackgroundImage})`
        gsap.killTweensOf(backgroundLayerRef.current)
        gsap.fromTo(
          backgroundLayerRef.current,
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1, duration: 0.9, ease: CAROUSEL_EASE }
        )

        if (coverRef.current) {
          gsap.killTweensOf(coverRef.current)
          gsap.fromTo(
            coverRef.current,
            { xPercent: -100, opacity: 0.85 },
            {
              xPercent: 100,
              opacity: 0,
              duration: 0.9,
              ease: CAROUSEL_EASE,
              onComplete: () => {
                if (coverRef.current) {
                  coverRef.current.style.transform = 'translateX(-100%)'
                  coverRef.current.style.opacity = '0.85'
                }
              }
            }
          )
        }
      } catch (error) {
        console.error('Unable to animate GuideVoyage background', error)
      }
    }

    animateBackground()

    return () => {
      isCancelled = true
      if (gsapInstance) {
        if (backgroundLayerRef.current) {
          gsapInstance.killTweensOf(backgroundLayerRef.current)
        }
        if (coverRef.current) {
          gsapInstance.killTweensOf(coverRef.current)
        }
      }
    }
  }, [currentBackgroundImage, voyagesSectionNode])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!voyagesSectionNode || !backgroundLayerRef.current) {
      parallaxTweenRef.current?.kill()
      parallaxTweenRef.current = null
      return
    }

    let isCancelled = false

    const setupParallax = async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger')
        ])

        if (!backgroundLayerRef.current || !voyagesSectionNode || isCancelled) {
          return
        }

        gsap.registerPlugin(ScrollTrigger)
        parallaxTweenRef.current?.kill()
        parallaxTweenRef.current = gsap.fromTo(
          backgroundLayerRef.current,
          { yPercent: -18 },
          {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: {
              trigger: voyagesSectionNode,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          }
        )
      } catch (error) {
        console.error('Unable to initialize GuideVoyage background parallax', error)
      }
    }

    setupParallax()

    return () => {
      isCancelled = true
      parallaxTweenRef.current?.kill()
      parallaxTweenRef.current = null
    }
  }, [voyagesSectionNode, currentBackgroundImage])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (prefersReducedMotion.matches) {
      return
    }

    let revertMatchMedia: (() => void) | undefined
    let isCancelled = false

    const setupSticky = async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger')
        ])

        if (!stickyRowRef.current || isCancelled) {
          return
        }

        const voyagesContainer = stickyRowRef.current.closest(VOYAGES_SECTION_SELECTOR) as HTMLElement | null
        if (!voyagesContainer) {
          return
        }

        gsap.registerPlugin(ScrollTrigger)
        const mm = gsap.matchMedia()
        revertMatchMedia = () => mm.revert()

        mm.add(STICKY_MEDIA_QUERY, () => {
          const target = stickyRowRef.current
          if (!target) {
            return undefined
          }

          const computePinDistance = () => {
            if (!voyagesContainer || !target) {
              return 0
            }

            const containerRect = voyagesContainer.getBoundingClientRect()
            const targetRect = target.getBoundingClientRect()
            const distanceBelowTarget =
              voyagesContainer.offsetHeight - (targetRect.top - containerRect.top) - targetRect.height

            return Math.max(distanceBelowTarget, 0)
          }

          const trigger = ScrollTrigger.create({
            trigger: target,
            start: () => `top top+=${STICKY_START_OFFSET_PX}`,
            end: () => `+=${computePinDistance()}`,
            pin: target,
            pinSpacing: false,
            anticipatePin: 0.5,
            invalidateOnRefresh: true
          })

          return () => {
            trigger.kill()
          }
        })
      } catch (error) {
        console.error('Unable to initialize GuideVoyage sticky behaviour', error)
      }
    }

    setupSticky()

    return () => {
      isCancelled = true
      revertMatchMedia?.()
    }
  }, [])

  const backgroundPortal =
    voyagesSectionNode && typeof window !== 'undefined'
      ? createPortal(
          <div className="guide-voyage-section__decor" aria-hidden="true">
            <div ref={backgroundLayerRef} className="guide-voyage-section__background" />
            <div className="guide-voyage-section__gradient" />
            <div ref={coverRef} className="guide-voyage-section__cover" />
          </div>,
          voyagesSectionNode
        )
      : null

  return (
    <>
      {backgroundPortal}
      <div className="guide-voyage-content mt-10 flex flex-row items-start gap-4 sm:gap-10">
        <div ref={stickyRowRef} className="flex flex-1 min-w-0 flex-col gap-4 pb-24 text-left px-0 sm:px-8 md:flex-none md:w-5/12 md:px-10 md:pr-12 lg:w-2/5 lg:pl-[8rem] lg:pr-16">
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
      <div
        ref={swiperContainerRef}
        className="guide-voyage-carousel relative flex-1 min-w-0 overflow-hidden pl-0 pr-0 md:flex-none md:w-7/12 lg:w-3/5 mr-[-1.5rem] sm:mr-[-2.5rem] lg:mr-0"
      >
        {/* {!paginationDisabled ? (
          <div className="guide-voyage-carousel__hud">
            <div className="guide-voyage-carousel__numbers">
              <div className="guide-voyage-carousel__numbers-inner" style={slideNumbersStyle}>
                {sanitizedPosts.map((_, index) => (
                  <span
                    key={`slide-number-${index}`}
                    className={`guide-voyage-carousel__number${index === activeIndex ? ' is-active' : ''}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
            <div className="guide-voyage-carousel__progress">
              <div className="guide-voyage-carousel__progress-track">
                <div ref={indicatorProgressRef} className="guide-voyage-carousel__progress-fill" />
              </div>
            </div>
          </div>
        ) : null} */}
        <Swiper
          modules={[Navigation, Pagination]}
          className="mySwiper guide-voyage-carousel__swiper"
          slidesPerView={1.1}
          spaceBetween={18}
          // autoplay={
          //   shouldAutoplay
          //     ? {
          //         delay: CAROUSEL_AUTOPLAY_DELAY_MS,
          //         disableOnInteraction: false
          //       }
          //     : undefined
          // }
          // loop={shouldAutoplay}
          breakpoints={{
            480: { slidesPerView: 1.2, spaceBetween: 20 },
            640: { slidesPerView: 1.3, spaceBetween: 22 },
            768: { slidesPerView: 1.8, spaceBetween: 26 },
            1024: { slidesPerView: 2.5, spaceBetween: 20 }
          }}
          onSwiper={(instance) => {
            swiperInstanceRef.current = instance
          }}
          onSlideChange={({ realIndex, activeIndex: fallbackActiveIndex }) => {
            const derivedIndex =
              typeof realIndex === 'number' ? realIndex : fallbackActiveIndex ?? 0
            const clampedIndex = Math.min(derivedIndex, Math.max(sanitizedPosts.length - 1, 0))
            setActiveIndex(clampedIndex)
          }}
        >
          {sanitizedPosts.map((post, index) => {
            const itemDelay = BASE_DELAY_MS + index * STAGGER_DELAY_MS
            return (
              <SwiperSlide key={post.slug} className="carousel-item guide-voyage-carousel__slide">
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
            <SwiperSlide key="view-all" className="carousel-item guide-voyage-carousel__slide">
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
        .guide-voyage-section {
          position: relative;
          overflow: hidden;
          z-index: 0;
        }
        .guide-voyage-section:before{
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,rgba(255,255,255,1)0%,rgba(255,255,255,0)88%);
          pointer-events: none;
          z-index: 0;
          top: 0;
          height: 50px;
        }
        .guide-voyage-section:after{
          content: '';
          position: absolute;
          background: linear-gradient(0deg,rgba(255,255,255,1)0%,rgba(255,255,255,0)88%);
          pointer-events: none;
          z-index: 0;
          bottom: 0;
          height: 50px;
        }
        .guide-voyage-section__decor {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: -1;
          opacity: 0.18;
        }
        .guide-voyage-section__background {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: saturate(1.05) contrast(1.05);
          opacity: 0.18;
          transform: scale(1.04);
          will-change: transform;
        }
        .guide-voyage-section__cover {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0));
          transform: translateX(-100%);
          z-index: 2;
          mix-blend-mode: screen;
          pointer-events: none;
        }
        .guide-voyage-section__gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.35), transparent 55%),
            linear-gradient(180deg, rgba(0, 0, 0, 0.45), transparent 45%);
          mix-blend-mode: multiply;
          z-index: 1;
          pointer-events: none;
        }
        .guide-voyage-content {
          position: relative;
          z-index: 1;
        }
        .guide-voyage-carousel {
          position: relative;
          z-index: 10;
        }
        .guide-voyage-carousel__hud {
          position: absolute;
          left: 1rem;
          right: 1rem;
          bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 30;
          pointer-events: none;
        }
        .guide-voyage-carousel__arrow {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          background: rgba(0, 0, 0, 0.45);
          color: #fff;
          display: grid;
          place-items: center;
          transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;
          pointer-events: auto;
        }
        .guide-voyage-carousel__arrow:hover {
          background: rgba(255, 255, 255, 0.85);
          border-color: rgba(255, 255, 255, 0.85);
          color: #0f0f0f;
        }
        .guide-voyage-carousel__arrow svg {
          width: 20px;
          height: 20px;
        }
        .guide-voyage-carousel__progress {
          flex: 1;
        }
        .guide-voyage-carousel__progress-track {
          width: 100%;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
          overflow: hidden;
        }
        .guide-voyage-carousel__progress-fill {
          width: 100%;
          height: 100%;
          background: #000;
          transform-origin: left center;
          transform: scaleX(0);
        }
        .guide-voyage-carousel__numbers {
          width: 48px;
          height: 44px;
          overflow: hidden;
          pointer-events: none;
        }
        .guide-voyage-carousel__numbers-inner {
          display: flex;
          flex-direction: column;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .guide-voyage-carousel__number {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.4em;
          color: rgba(255, 255, 255, 0.55);
        }
        .guide-voyage-carousel__number.is-active {
          color: #fff;
        }
        .guide-voyage-carousel__swiper {
          position: relative;
          z-index: 10;
          padding-bottom: 2.5rem;
          padding-top: 0.5rem;
        }
        .guide-voyage-carousel__slide {
          position: relative;
          z-index: 10;
        }
        @media (max-width: 768px) {
          .guide-voyage-carousel__hud {
            left: 0.75rem;
            right: 0.75rem;
            bottom: 1rem;
          }
          .guide-voyage-carousel__numbers {
            display: none;
          }
        }
      `}</style>
    </div>
    </>
  )
}
