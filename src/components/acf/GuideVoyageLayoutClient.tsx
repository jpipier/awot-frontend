'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode
} from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Swiper, SwiperSlide } from 'swiper/react'
import { HashNavigation, Mousewheel, Navigation, Pagination } from 'swiper/modules'
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
  initialCursor?: string | null
  initialHasNextPage?: boolean
}

const STAGGER_DELAY_MS = 80
const BASE_DELAY_MS = 350
const STICKY_START_OFFSET_PX = 520
const STICKY_END_DISTANCE_MULTIPLIER = 1.5
const STICKY_MEDIA_QUERY = '(min-width: 1024px)'
const VOYAGES_SECTION_SELECTOR = '#voyages'
const CAROUSEL_AUTOPLAY_DELAY_MS = 5200
const CAROUSEL_EASE = 'sine.inOut'
const POSTS_BATCH_SIZE = 6

const slugify = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

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

export default function GuideVoyageLayoutClient({
  posts,
  categorySlug,
  initialCursor = null,
  initialHasNextPage = false
}: GuideVoyageLayoutClientProps) {
  const router = useRouter()
  const [displayedPosts, setDisplayedPosts] = useState<Article[]>(() => posts)
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | undefined>(categorySlug)
  const [paginationCursor, setPaginationCursor] = useState<string | null>(initialCursor)
  const [canLoadMorePosts, setCanLoadMorePosts] = useState<boolean>(initialHasNextPage)
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false)
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false)
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
  const slideImageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const transitionElementsRef = useRef<{
    overlay?: HTMLDivElement
    image?: HTMLImageElement
    timeline?: GSAPTimeline
  } | null>(null)
  const isTransitioningRef = useRef(false)
  const transitionCleanupTimeoutRef = useRef<number | null>(null)
  const prefetchedSlugsRef = useRef<Set<string>>(new Set())
  const isFetchingCategoryRef = useRef(false)
  const isFetchingMorePostsRef = useRef(false)
  const clearTransitionElements = () => {
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
  }

  const clearUrlHash = useCallback(() => {
    if (typeof window === 'undefined' || typeof window.history.replaceState !== 'function') {
      return
    }
    const { pathname, search } = window.location
    window.history.replaceState(null, '', `${pathname}${search}`)
  }, [])

  useEffect(() => {
    clearUrlHash()
  }, [clearUrlHash])

  useEffect(() => {
    setDisplayedPosts(posts)
    setActiveCategorySlug(categorySlug)
    setPaginationCursor(initialCursor ?? null)
    setCanLoadMorePosts(Boolean(initialHasNextPage))
    isFetchingMorePostsRef.current = false
    setIsLoadingMorePosts(false)
    setActiveIndex(0)
    prefetchedSlugsRef.current = new Set()
    slideImageRefs.current = {}
  }, [categorySlug, initialCursor, initialHasNextPage, posts])

  const sanitizedPosts = useMemo(
    () =>
      displayedPosts.map((post) => ({
        ...post,
        excerptPlain: he
          .decode(post.excerpt ?? '')
          .replace(/<[^>]*>/g, '')
          .trim()
      })),
    [displayedPosts]
  )

  const current = sanitizedPosts[activeIndex] ?? sanitizedPosts[0]

  const shouldAutoplay = sanitizedPosts.length > 1
  const currentBackgroundImage =
    current?.optionsArticles?.imagePortait?.node?.sourceUrl ??
    current?.optionsArticles?.imagePortait?.node?.guid ??
    current?.optionsArticles?.imagePaysage?.node?.sourceUrl ??
    current?.optionsArticles?.imagePaysage?.node?.guid ??
    current?.featuredImage?.node?.sourceUrl ??
    current?.featuredImage?.node?.guid ??
    null
  const paginationDisabled = sanitizedPosts.length <= 1
  const slideNumbersStyle: CSSProperties = {
    transform: `translateY(-${activeIndex * 100}%)`
  }
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

  const loadCategoryPosts = useCallback(
    async (slug: string) => {
      if (!slug || isFetchingCategoryRef.current) {
        return
      }

      isFetchingCategoryRef.current = true
      isFetchingMorePostsRef.current = false
      setIsUpdatingCategory(true)
      setIsLoadingMorePosts(false)

      try {
        const params = new URLSearchParams({ limit: String(POSTS_BATCH_SIZE) })
        const response = await fetch(`/api/categories/${slug}/posts?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Unable to load category posts')
        }

        const data = await response.json()
        const nextPosts = data?.nodes ?? []
        const nextPageInfo = data?.pageInfo ?? {}

        prefetchedSlugsRef.current = new Set()
        slideImageRefs.current = {}
        setActiveIndex(0)
        setActiveCategorySlug(slug)
        setDisplayedPosts(nextPosts)
        setPaginationCursor(nextPageInfo?.endCursor ?? null)
        setCanLoadMorePosts(Boolean(nextPageInfo?.hasNextPage))
      } catch (error) {
        console.error('Unable to load category posts', error)
      } finally {
        isFetchingCategoryRef.current = false
        setIsUpdatingCategory(false)
      }
    },
    []
  )

  const loadMorePosts = useCallback(async () => {
    if (
      !activeCategorySlug ||
      !canLoadMorePosts ||
      !paginationCursor ||
      isFetchingMorePostsRef.current ||
      isFetchingCategoryRef.current
    ) {
      return
    }

    isFetchingMorePostsRef.current = true
    setIsLoadingMorePosts(true)

    try {
      const params = new URLSearchParams({
        limit: String(POSTS_BATCH_SIZE),
        cursor: paginationCursor
      })
      const response = await fetch(`/api/categories/${activeCategorySlug}/posts?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Unable to load more category posts')
      }

      const data = await response.json()
      const incomingPosts = data?.nodes ?? []
      const nextPageInfo = data?.pageInfo ?? {}

      setDisplayedPosts((prev) => {
        if (!incomingPosts.length) {
          return prev
        }

        const existingSlugs = new Set(prev.map((post) => post.slug).filter(Boolean))
        const uniqueIncomingPosts = incomingPosts.filter((post: Article) =>
          post.slug ? !existingSlugs.has(post.slug) : true
        )

        if (!uniqueIncomingPosts.length) {
          return prev
        }

        return [...prev, ...uniqueIncomingPosts]
      })
      setPaginationCursor(nextPageInfo?.endCursor ?? null)
      setCanLoadMorePosts(Boolean(nextPageInfo?.hasNextPage))
    } catch (error) {
      console.error('Unable to load more category posts', error)
    } finally {
      isFetchingMorePostsRef.current = false
      setIsLoadingMorePosts(false)
    }
  }, [activeCategorySlug, canLoadMorePosts, paginationCursor])

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
      const isMobile = viewportWidth < 768
      const topTarget = isMobile ? 0 : viewportHeight * 0.05
      const leftTarget = isMobile ? 0 : viewportWidth * 0.02
      const finalHeight = isMobile ? viewportHeight * 0.61 : viewportHeight * 0.9
      const finalWidth = isMobile ? viewportWidth : viewportWidth * 0.44

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
      console.error('Unable to animate GuideVoyage transition', error)
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
    return () => {
      clearTransitionElements()
    }
  }, [])

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, Math.max(sanitizedPosts.length - 1, 0)))
  }, [sanitizedPosts.length])

  // Listen for category changes triggered by the CategoryMenuClient
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleCategoryChange = (event: Event) => {
      const detail = (event as CustomEvent<{ slug?: string }>).detail
      const nextSlug = detail?.slug

      if (!nextSlug) {
        return
      }

      if (nextSlug === activeCategorySlug) {
        if (swiperInstanceRef.current) {
          if (typeof swiperInstanceRef.current.slideToLoop === 'function') {
            swiperInstanceRef.current.slideToLoop(0, 0)
          } else {
            swiperInstanceRef.current.slideTo(0)
          }
        }
        return
      }

      void loadCategoryPosts(nextSlug)
    }

    window.addEventListener('guidevoyage:category-change', handleCategoryChange as EventListener)
    return () => {
      window.removeEventListener('guidevoyage:category-change', handleCategoryChange as EventListener)
    }
  }, [activeCategorySlug, loadCategoryPosts])

  useEffect(() => {
    const PREFETCH_LIMIT = 4
    sanitizedPosts.slice(0, PREFETCH_LIMIT).forEach((post) => {
      void prefetchArticle(post.slug)
    })
  }, [sanitizedPosts, prefetchArticle])

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

            return Math.max((distanceBelowTarget - 100) * STICKY_END_DISTANCE_MULTIPLIER, 0)
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
      <div className="guide-voyage-content mt-10 flex flex-col md:flex-row items-start gap-4 sm:gap-10">
        <div ref={stickyRowRef} className="flex w-full min-w-0 flex-col gap-4 pb-[130px] text-left px-0 sm:px-8 md:flex-none md:w-5/12 md:px-10 md:pr-12 lg:w-2/5 lg:pl-[8rem] lg:pr-16 font-brandonRegular">
        <h2 className="text-2xl font-montserrat font-medium uppercase leading-tight">{current?.title}</h2>
        {current?.optionsArticles?.champsLibrePageAccueil ? (
          <h3 className="text-lg text-gray-600 italic font-montserrat italic">
            {current.optionsArticles.champsLibrePageAccueil}
          </h3>
        ) : null}
        <p className="font-light font-montserrat">{current?.excerptPlain}</p>
        {current?.slug ? (
          <Link
            href={`/articles/${current.slug}`}
            className="text-xs uppercase tracking-[0.2em] text-current hover:italic"
          >
            Lire la suite
            <span aria-hidden="true" >
              <div aria-hidden="true" style={{ position: 'relative', display: 'inline-block' }}>→</div>
            </span>
          </Link>
        ) : null}
      </div>
      <div
        ref={swiperContainerRef}
        className="guide-voyage-carousel relative w-full min-w-0 overflow-hidden pl-0 pr-0 md:flex-none md:w-7/12 lg:w-3/5 mr-[-1.5rem] sm:mr-[-2.5rem] lg:mr-0"
        aria-busy={isUpdatingCategory || isLoadingMorePosts}
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
          modules={[Navigation, Pagination, HashNavigation, Mousewheel]}
          key={activeCategorySlug ?? 'guide-voyage-default'}
          className="mySwiper guide-voyage-carousel__swiper awot-carousel-cursor"
          slidesPerView={1.1}
          spaceBetween={18}
          loop={false}
          hashNavigation={{
            watchState: false,
            replaceState: true
          }}
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
          mousewheel={{
            forceToAxis: true,
            releaseOnEdges: true,
            thresholdDelta: 24,
            thresholdTime: 420,
            sensitivity: 0.6
          }}
          onHashSet={clearUrlHash}
          onSwiper={(instance) => {
            swiperInstanceRef.current = instance
          }}
          onSlideNextTransitionStart={() => {
            void loadMorePosts()
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
            const portraitImage = post.optionsArticles?.imagePortait?.node
            const paysageImage = post.optionsArticles?.imagePaysage?.node
            const fallbackImage = post.featuredImage?.node
            const portraitSrc =
              portraitImage?.sourceUrl ?? portraitImage?.guid ??
              paysageImage?.sourceUrl ?? paysageImage?.guid ??
              fallbackImage?.sourceUrl ?? fallbackImage?.guid ?? null
            const portraitAlt = portraitImage?.altText ?? paysageImage?.altText ?? fallbackImage?.altText ?? post.title
            return (
              <SwiperSlide key={post.slug} data-hash={slugify(post.title)} className="carousel-item guide-voyage-carousel__slide">
                <AnimatedCarouselItem className="group relative" delay={itemDelay} forceVisible={isCarouselVisible}>
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
                    {portraitSrc ? (
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
                      className="relative w-full overflow-hidden h-[280px] md:h-[420px] lg:h-[380px] xl:h-[480px] 3xl:h-[540px]"
                    >
                      <Image
                        src={portraitSrc}
                        alt={portraitAlt}
                        fill
                          className="object-cover shadow-md transition-transform duration-300 group-hover:scale-110"
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div className="mt-3">
                      <p className="mb-1 text-[12px] uppercase font-montserrat italic" dangerouslySetInnerHTML={{ __html: post.optionsArticles?.champsLibrePageAccueil ?? '' }} />
                      <h3 className="mt-2 text-left text-[15px] uppercase font-brandonRegular font-medium">{post.title}</h3>
                    </div>
                  </Link>
                </AnimatedCarouselItem>
              </SwiperSlide>
            )
          })}
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
          font-size: 0.85vw;
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
