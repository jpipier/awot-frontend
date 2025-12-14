'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Navigation, Pagination } from 'swiper/modules'
import type { Article } from '@/types/wordpress'
import type { gsap as GSAP } from 'gsap'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const UNIFORM_HEIGHT_TITLES = new Set(['food', 'hebergement', 'hebergements', 'voyage', 'voyages'])
const BASE_DELAY_MS = 250
const STAGGER_DELAY_MS = 150
const SCROLL_ANIMATED_ITEM_COUNT = 3
const SCROLL_ANIMATION_END = 0.5
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

type GSAPTimeline = ReturnType<GSAP['timeline']>

interface CarouselLayoutClientProps {
  posts: Article[]
  titreDeLaSection?: string | null
  headline?: string | null
  contenu?: string | null
  postParPage: number
  categorySlug?: string
}

function AnimatedCarouselItem({
  children,
  className,
  delay = 0,
  forceVisible = false,
  scrollProgress,
  scrollWindow = 1,
  scrollIndex = 0,
  shouldForceSettled = false
}: {
  children: ReactNode
  className?: string
  delay?: number
  forceVisible?: boolean
  scrollProgress?: number
  scrollWindow?: number
  scrollIndex?: number
  shouldForceSettled?: boolean
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
  const hasScrollProgress = typeof scrollProgress === 'number'
  const startThreshold = scrollWindow * scrollIndex
  const normalizedScroll = hasScrollProgress
    ? Math.min(Math.max((scrollProgress - startThreshold) / (scrollWindow || 1), 0), 1)
    : null

  const stateClass = effectiveVisible ? 'carousel-animated-item--visible' : 'carousel-animated-item--hidden'
  const combinedClassName = ['carousel-animated-item', !hasScrollProgress ? stateClass : '', className]
    .filter(Boolean)
    .join(' ')

  const opacityTarget = shouldForceSettled ? 1 : normalizedScroll ?? (effectiveVisible ? 1 : 0)
  const translateAmount = shouldForceSettled ? 0 : (1 - opacityTarget) * 60
  const style: CSSProperties = {
    opacity: opacityTarget,
    transform: `translate3d(${translateAmount}px, 0, 0)`
  }

  if (!hasScrollProgress && effectiveVisible && !shouldForceSettled) {
    style.transitionDelay = `${Math.max(delay, 0)}ms`
  }

  return (
    <div ref={containerRef} className={combinedClassName} style={style}>
      {children}
    </div>
  )
}

export default function CarouselLayoutClient({
  posts,
  titreDeLaSection,
  headline,
  contenu,
  postParPage,
  categorySlug
}: CarouselLayoutClientProps) {
  const router = useRouter()
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [isTitleVisible, setIsTitleVisible] = useState(false)
  const [isHeadlineVisible, setIsHeadlineVisible] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(false)
  const [titleScrollProgress, setTitleScrollProgress] = useState(0)
  const [isCarouselVisible, setIsCarouselVisible] = useState(false)
  const [carouselScrollProgress, setCarouselScrollProgress] = useState(0)
  const [shouldForceSettled, setShouldForceSettled] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const headlineTransition: CSSProperties = { transitionDelay: isHeadlineVisible ? '80ms' : '0ms' }
  const titleTransition: CSSProperties = { transitionDelay: isTitleVisible ? '120ms' : '0ms' }
  const contentTransition: CSSProperties = { transitionDelay: isContentVisible ? '480ms' : '0ms' }
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const slideImageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const transitionElementsRef = useRef<{
    overlay?: HTMLDivElement
    image?: HTMLImageElement
    timeline?: GSAPTimeline
  } | null>(null)
  const isTransitioningRef = useRef(false)
  const transitionCleanupTimeoutRef = useRef<number | null>(null)
  const prefetchedSlugsRef = useRef<Set<string>>(new Set())

  const clearTransitionElements = useCallback(() => {
    if (transitionCleanupTimeoutRef.current) {
      window.clearTimeout(transitionCleanupTimeoutRef.current)
      transitionCleanupTimeoutRef.current = null
    }
    if (transitionElementsRef.current?.timeline) {
      transitionElementsRef.current.timeline.kill()
    }
    transitionElementsRef.current?.overlay?.remove()
    transitionElementsRef.current?.image?.remove()
    transitionElementsRef.current = null
    isTransitioningRef.current = false
    document.documentElement.classList.remove('is-guide-transitioning')
  }, [])

  const prefetchArticle = useCallback(
    async (slug?: string) => {
      if (!slug || prefetchedSlugsRef.current.has(slug) || typeof router.prefetch !== 'function') {
        return
      }

      prefetchedSlugsRef.current.add(slug)

      try {
        const href = `/articles/${slug}`
        const maybePromise = router.prefetch(href)
        await Promise.resolve(maybePromise)
      } catch (error) {
        prefetchedSlugsRef.current.delete(slug)
        console.error('Unable to prefetch article page', error)
      }
    },
    [router]
  )

  const startImageTransition = async (
    imageWrapper: HTMLDivElement,
    imageElement: HTMLImageElement,
    href: string,
    slug?: string
  ) => {
    if (isTransitioningRef.current) {
      return
    }

    void prefetchArticle(slug)
    isTransitioningRef.current = true
    document.documentElement.classList.add('is-guide-transitioning')

    const overlay = document.createElement('div')
    overlay.className = 'guide-voyage-transition-backdrop'
    overlay.setAttribute('aria-hidden', 'true')
    document.body.appendChild(overlay)

    const floatingImage = imageElement.cloneNode(true) as HTMLImageElement
    const wrapperBounds = imageWrapper.getBoundingClientRect()
    const wrapperStyles = window.getComputedStyle(imageWrapper)
    floatingImage.classList.add('guide-voyage-transition-image')
    floatingImage.style.top = `${wrapperBounds.top}px`
    floatingImage.style.left = `${wrapperBounds.left}px`
    floatingImage.style.width = `${wrapperBounds.width}px`
    floatingImage.style.height = `${wrapperBounds.height}px`
    floatingImage.style.borderRadius = wrapperStyles.borderRadius || '0px'
    floatingImage.style.position = 'fixed'
    floatingImage.style.objectFit = 'cover'
    floatingImage.style.pointerEvents = 'none'
    floatingImage.style.zIndex = '9997'
    floatingImage.style.willChange = 'transform, top, left, width, height'
    document.body.appendChild(floatingImage)
    transitionElementsRef.current = { overlay, image: floatingImage }

    try {
      const { default: gsap } = await import('gsap')
      const viewportHeight = window.innerHeight || wrapperBounds.height
      const viewportWidth = window.innerWidth || wrapperBounds.width
      const topTarget = viewportHeight * 0.05
      const leftTarget = viewportWidth * 0.02
      const finalHeight = viewportHeight * 0.9
      const finalWidth = viewportWidth * 0.44

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          router.push(href)
          transitionCleanupTimeoutRef.current = window.setTimeout(() => {
            clearTransitionElements()
          }, 700)
        },
        onInterrupt: clearTransitionElements
      })

      timeline.to(
        overlay,
        {
          opacity: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRadius: '18px',
          duration: 0.45
        },
        0
      )

      timeline.to(
        floatingImage,
        {
          top: `${topTarget}px`,
          left: `${leftTarget}px`,
          width: `${finalWidth}px`,
          height: `${finalHeight}px`,
          borderRadius: '0',
          duration: 0.6,
          ease: 'power4.inOut'
        },
        0
      )

      if (transitionElementsRef.current) {
        transitionElementsRef.current.timeline = timeline
      }
    } catch (error) {
      console.error('Unable to animate carousel transition', error)
      clearTransitionElements()
      router.push(href)
    }
  }

  const handleSlideClick = (event: MouseEvent<HTMLAnchorElement>, post: Article) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    if (typeof window === 'undefined' || !post.slug) {
      return
    }

    const imageWrapper = slideImageRefs.current[post.slug] ?? null
    const imageElement = imageWrapper?.querySelector('img') ?? null
    if (!imageWrapper || !(imageElement instanceof HTMLImageElement)) {
      return
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (prefersReducedMotion?.matches) {
      return
    }

    if (isTransitioningRef.current) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    void startImageTransition(imageWrapper, imageElement, `/articles/${post.slug}`, post.slug)
  }

  useEffect(() => {
    const element = headlineRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeadlineVisible(entry.isIntersecting)
      },
      { threshold: 0.25 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTransitionElements()
    }
  }, [clearTransitionElements])

  useEffect(() => {
    const PREFETCH_LIMIT = 4
    posts.slice(0, PREFETCH_LIMIT).forEach((post) => {
      void prefetchArticle(post.slug)
    })
  }, [posts, prefetchArticle])

  useEffect(() => {
    const element = titleRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTitleVisible(entry.isIntersecting)
      },
      { threshold: 0.25 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const element = contentRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsContentVisible(entry.isIntersecting)
      },
      { threshold: 0.25 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCarouselVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(section)

    return () => {
      observer.disconnect()
    }
  }, [])
  useEffect(() => {
    const section = sectionRef.current
    if (!section) {
      return
    }
    let frame = 0
    const updateProgress = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1
      const totalDistance = rect.height + viewportHeight
      const distance = viewportHeight - rect.top
      const nextProgress = Math.min(Math.max(distance / totalDistance, 0), 1)
      setCarouselScrollProgress((prev) => {
        if (Math.abs(prev - nextProgress) < 0.01) {
          return prev
        }
        return nextProgress
      })
    }

    updateProgress()

    const handleScroll = () => {
      if (frame) {
        return
      }
      frame = window.requestAnimationFrame(updateProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const updateIsDesktop = (event?: MediaQueryListEvent) => {
      setIsDesktop(event?.matches ?? mediaQuery.matches)
    }

    updateIsDesktop()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateIsDesktop)
    } else {
      mediaQuery.addListener(updateIsDesktop)
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', updateIsDesktop)
      } else {
        mediaQuery.removeListener(updateIsDesktop)
      }
    }
  }, [])

  const normalizedTitle = titreDeLaSection
    ?.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const normalizedHeadline = headline
    ?.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  const isBonnesAdressesHeadline = normalizedHeadline === 'bonnes adresses'
  const titleScrollEnabled = normalizedTitle === 'hebergements' && isDesktop
  const useUniformHeights = normalizedTitle ? UNIFORM_HEIGHT_TITLES.has(normalizedTitle) : false
  const imageWrapperHeightClass = useUniformHeights
    ? 'h-[420px] md:h-[520px] lg:h-[360px] xl:h-[480px] 3xl:h-[540px]'
    : 'h-[275px] md:h-[500px] lg:h-[360px] xl:h-[480px] 3xl:h-[590px]'

  useEffect(() => {
    if (!titleScrollEnabled) {
      setTitleScrollProgress(0)
      return
    }

    let frame = 0

    const updateProgress = () => {
      frame = 0

      const section = sectionRef.current
      if (!section) {
        return
      }

      const rect = section.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1
      const clampedTop = Math.min(Math.max(rect.top, 0), viewportHeight)
      const nextProgress = Math.min(Math.max(1 - clampedTop / viewportHeight, 0), 1)

      setTitleScrollProgress((prev) => {
        if (Math.abs(prev - nextProgress) < 0.005) {
          return prev
        }
        return nextProgress
      })
    }

    const handleScroll = () => {
      if (frame) {
        return
      }
      frame = window.requestAnimationFrame(updateProgress)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [titleScrollEnabled])

  const headlineStartOffset = isBonnesAdressesHeadline ? -450 : -80
  const titleStartOffset = isBonnesAdressesHeadline ? -470 : -90
  const scrollCatchupFactor = isBonnesAdressesHeadline ? 2 : 1.6
  const computeOffset = (startOffset: number) => {
    if (!titleScrollEnabled) {
      return 0
    }
    const easedProgress = Math.min(titleScrollProgress * scrollCatchupFactor, 1)
    const remaining = 1 - easedProgress
    return remaining * startOffset
  }
  const headlineScrollOffset = computeOffset(headlineStartOffset)
  const titleScrollOffset = computeOffset(titleStartOffset)
  const headlineOpacity = titleScrollEnabled ? Math.min(Math.max(titleScrollProgress * 4, 0), 1) : undefined
  const titleOpacity = titleScrollEnabled ? Math.min(Math.max(titleScrollProgress * 5, 0), 1) : undefined
  const computedHeadlineStyle: CSSProperties = titleScrollEnabled
    ? { ...headlineTransition, transform: `translateY(${headlineScrollOffset}px)`, opacity: headlineOpacity }
    : headlineTransition
  const computedTitleStyle: CSSProperties = titleScrollEnabled
    ? {
        ...titleTransition,
        transform: `translateY(${titleScrollOffset}px)`,
        opacity: titleOpacity
      }
    : titleTransition
  const baseTitleClass = 'font-schnyder_wide_xl_webdemi leading-tight text-[13vw] lg:text-[5vw] text-left'
  const easingClass = titleScrollEnabled
    ? 'transform will-change-transform transition-opacity duration-500 ease-out'
    : 'transform transition-all duration-700 ease-out'
  const visibilityClass = titleScrollEnabled ? '' : isTitleVisible ? 'opacity-100' : 'opacity-0'
  const translateClass =
    titleScrollEnabled || !titreDeLaSection
      ? ''
      : isTitleVisible
        ? 'translate-y-0'
        : '-translate-y-16'
  const titleClassName = [baseTitleClass, easingClass, visibilityClass, translateClass].filter(Boolean).join(' ')
  const baseHeadlineClass = 'text-sm uppercase tracking-wide text-gray-600 -mb-[2rem] font-montserrat'
  const headlineEasingClass = titleScrollEnabled
    ? 'transform will-change-transform transition-opacity duration-500 ease-out'
    : 'transform transition-all duration-700 ease-out'
  const headlineVisibilityClass = titleScrollEnabled ? '' : isHeadlineVisible ? 'opacity-100' : 'opacity-0'
  const headlineTranslateClass =
    titleScrollEnabled
      ? ''
      : isHeadlineVisible
        ? 'translate-y-0'
        : '-translate-y-16'
  const headlineClassName = [
    baseHeadlineClass,
    headlineEasingClass,
    headlineVisibilityClass,
    headlineTranslateClass
  ]
    .filter(Boolean)
    .join(' ')
  const scrollAnimatedCount = Math.min(posts.length, SCROLL_ANIMATED_ITEM_COUNT)
  const scrollWindow =
    scrollAnimatedCount > 0 ? SCROLL_ANIMATION_END / scrollAnimatedCount : 1
  const scheduleSettledReset = () => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
    }
    resetTimeoutRef.current = setTimeout(() => {
      setShouldForceSettled(false)
      resetTimeoutRef.current = null
    }, 220)
  }
  const handleSlideMotionStart = () => {
    if (!shouldForceSettled) {
      setShouldForceSettled(true)
    }
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
  }
  const handleSlideMotionEnd = () => {
    scheduleSettledReset()
  }

  return (
    <div ref={sectionRef} className="mx-auto max-w-screen-full px-6 sm:px-10 lg:px-0">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-end">
        <div
          className={`flex w-full flex-col gap-6 px-4 text-left lg:pb-[3rem] ${
            postParPage > 2 ? 'lg:w-2/5 lg:px-[8rem]' : 'lg:w-3/5 lg:px-[8rem]'
          }`}
        >
          {headline ? (
            <h3 ref={headlineRef} style={computedHeadlineStyle} className={headlineClassName}>
              {headline}
            </h3>
          ) : null}
          {titreDeLaSection ? (
            <h2
              ref={titleRef}
              style={computedTitleStyle}
              className={titleClassName}
            >
              {titreDeLaSection}
            </h2>
          ) : null}
          {contenu ? (
            <div
              ref={contentRef}
              style={contentTransition}
              className={`font-montserrat transform transition-all duration-700 ease-out ${
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
              }`}
              dangerouslySetInnerHTML={{ __html: contenu }}
            />
          ) : null}
        </div>
        <div className={`w-full overflow-hidden lg:pl-0 ${postParPage > 2 ? 'lg:w-3/5' : 'lg:w-2/5'}`}>
          <Swiper
            modules={[Navigation, Pagination, Mousewheel]}
            className="mySwiper"
            slidesPerView={1.2}
            spaceBetween={20}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 1.5, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: {
                slidesPerView: postParPage > 2 ? 2.5 : 1.5,
                spaceBetween: 20
              }
            }}
            mousewheel={{ forceToAxis: true, releaseOnEdges: true, sensitivity: 0.7 }}
            onSliderMove={handleSlideMotionStart}
            onTouchStart={handleSlideMotionStart}
            onTransitionStart={handleSlideMotionStart}
            onTouchEnd={handleSlideMotionEnd}
            onTransitionEnd={handleSlideMotionEnd}
            onSlideChangeTransitionEnd={handleSlideMotionEnd}
          >
            {posts.map((post, index) => {
              const itemDelay = BASE_DELAY_MS + index * STAGGER_DELAY_MS
              const useScrollReveal = index < scrollAnimatedCount
              return (
                <SwiperSlide key={post.slug} className="carousel-item">
                  <AnimatedCarouselItem
                    className="group relative"
                    delay={itemDelay}
                    forceVisible={isCarouselVisible}
                    {...(useScrollReveal
                      ? {
                          scrollProgress: carouselScrollProgress,
                          scrollWindow,
                          scrollIndex: index
                        }
                      : {})}
                    shouldForceSettled={shouldForceSettled}
                  >
                    <Link
                      href={`/articles/${post.slug}`}
                      className="block"
                      onClick={(event) => handleSlideClick(event, post)}
                      onPointerEnter={() => {
                        void prefetchArticle(post.slug)
                      }}
                      onFocus={() => {
                        void prefetchArticle(post.slug)
                      }}
                    >
                      {post.optionsArticles?.imagePortait?.node?.guid ? (
                        <div
                          ref={(node) => {
                            if (!post.slug) {
                              return
                            }
                            if (node) {
                              slideImageRefs.current[post.slug] = node
                            } else {
                              delete slideImageRefs.current[post.slug]
                            }
                          }}
                          className={`relative w-full overflow-hidden ${imageWrapperHeightClass}`}
                        >
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
                        <p
                          className="mb-0 text-[0.5vw] uppercase font-montserrat italic text-gray-600"
                          dangerouslySetInnerHTML={{
                            __html: post.optionsArticles?.champsLibrePageAccueil ?? ''
                          }}
                        />
                        <h3 className="text-[3vw] md:text-xs uppercase font-brandonRegular font-medium ">{post.title}</h3>
                      </div>
                    </Link>
                  </AnimatedCarouselItem>
                </SwiperSlide>
              )
            })}
            {categorySlug ? (
              <SwiperSlide key="view-all" className="carousel-item">
                <AnimatedCarouselItem
                  delay={BASE_DELAY_MS + posts.length * STAGGER_DELAY_MS}
                  forceVisible={isCarouselVisible}
                  shouldForceSettled={shouldForceSettled}
                >
                  <Link
                    href={`/categories/${categorySlug}`}
                    className={`relative block h-full w-full overflow-hidden ${imageWrapperHeightClass}`}
                  >
                    <div className="flex h-full w-full items-center justify-center rounded-md border border-black bg-black text-white transition-colors duration-300 hover:bg-white hover:text-black">
                      <span className="font-montserrat text-xs uppercase tracking-[0.3em]">
                        Découvrir tous
                      </span>
                    </div>
                  </Link>
                </AnimatedCarouselItem>
              </SwiperSlide>
            ) : null}
          </Swiper>
        </div>
      </div>
      <style jsx global>{`
        .carousel-animated-item {
          will-change: transform, opacity;
          transition: transform 1.9s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.9s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .carousel-animated-item--hidden {
          opacity: 0;
          transform: translateX(60px);
          transition-delay: 0ms !important;
        }
        .carousel-animated-item--visible {
          opacity: 1;
          transform: translateX(0);
        }
        .guide-voyage-transition-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0);
          backdrop-filter: blur(0);
          -webkit-backdrop-filter: blur(0);
          opacity: 0;
          pointer-events: none;
          z-index: 9996;
          will-change: opacity, backdrop-filter;
        }
        .guide-voyage-transition-image {
          position: fixed;
          pointer-events: none;
          object-fit: cover;
          z-index: 9997;
        }
      `}</style>
    </div>
  )
}
