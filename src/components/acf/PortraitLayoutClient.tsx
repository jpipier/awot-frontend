'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Mousewheel, Navigation, Pagination, HashNavigation } from 'swiper/modules'
import type { Swiper as SwiperInstance } from 'swiper'
import type { Article } from '@/types/wordpress'
import { sanitizeExcerptText } from '@/lib/sanitize-excerpt-text'
import { sanitizePostTitleHtml } from '@/lib/sanitize-post-title-html'
import type { gsap as GSAP } from 'gsap'

import 'swiper/css'
import 'swiper/css/navigation'

interface PortraitLayoutClientProps {
  posts: Article[]
  titreDeLaSection: string
  contenu: string
  categorySlug?: string
  link?: {
    target?: string | null
    title?: string | null
    url?: string | null
  }
}

const TEXT_ANIMATION_DURATION = 1.8
const TEXT_ANIMATION_STAGGER = 0.24
const CAROUSEL_BASE_DELAY = 300
const CAROUSEL_STAGGER_DELAY = 140
const TRANSITION_PUSH_OFFSET_S = 0.58
const TRANSITION_MAX_WAIT_MS = 45000
type GSAPTimeline = ReturnType<GSAP['timeline']>

const slugify = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

const toAccessibleLabel = (value?: string | null) => {
  if (!value) {
    return 'article'
  }

  const cleaned = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return cleaned || 'article'
}

function buildLocalisationLabel(post?: Article) {
  const edges = post?.localisations?.edges ?? []

  if (!edges.length) {
    return null
  }

  const childEdge = edges.find((edge) => edge.node.parent?.node)
  const target = childEdge ?? edges[0]

  if (!target?.node?.name) {
    return null
  }

  return target.node.name
}

export default function PortraitLayoutClient({
  posts,
  titreDeLaSection,
  contenu,
  categorySlug,
  link
}: PortraitLayoutClientProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTextBlockVisible, setIsTextBlockVisible] = useState(false)
  const textBlockRef = useRef<HTMLDivElement | null>(null)
  const textAnimatedBlockRef = useRef<HTMLDivElement | null>(null)
  const swiperInstanceRef = useRef<SwiperInstance | null>(null)
  const slideImageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const transitionElementsRef = useRef<{
    overlay?: HTMLDivElement
    image?: HTMLImageElement
    timeline?: GSAPTimeline
  } | null>(null)
  const isTransitioningRef = useRef(false)
  const transitionCleanupTimeoutRef = useRef<number | null>(null)
  const prefetchedSlugsRef = useRef<Set<string>>(new Set())
  const prefetchInFlightRef = useRef<Map<string, Promise<void>>>(new Map())
  const gsapRef = useRef<any>(null)
  const splitTextCtorRef = useRef<any>(null)
  const splitInstancesRef = useRef<Array<{ revert: () => void }> | null>(null)
  const textAnimationRef = useRef<any>(null)
  const splitReadyRef = useRef(false)
  const isTextVisibleRef = useRef(false)

  const clearTransitionElements = useCallback(() => {
    if (transitionCleanupTimeoutRef.current) {
      window.clearTimeout(transitionCleanupTimeoutRef.current)
      transitionCleanupTimeoutRef.current = null
    }
    const currentTransition = transitionElementsRef.current
    const timeline = currentTransition?.timeline
    if (currentTransition) {
      currentTransition.timeline = undefined
    }
    if (timeline) {
      timeline.kill()
    }
    currentTransition?.overlay?.remove()
    currentTransition?.image?.remove()
    transitionElementsRef.current = null
    isTransitioningRef.current = false
    document.documentElement.classList.remove('is-guide-transitioning')
  }, [])

  const prefetchArticle = useCallback(
    (slug?: string) => {
      if (!slug || typeof router.prefetch !== 'function') {
        return Promise.resolve()
      }

      if (prefetchedSlugsRef.current.has(slug)) {
        return Promise.resolve()
      }

      const inFlightPrefetch = prefetchInFlightRef.current.get(slug)
      if (inFlightPrefetch) {
        return inFlightPrefetch
      }

      const href = `/articles/${slug}`
      const prefetchPromise = Promise.resolve(router.prefetch(href))
        .then(() => {
          prefetchedSlugsRef.current.add(slug)
        })
        .catch((error) => {
          console.error('Unable to prefetch article page', error)
          throw error
        })
        .finally(() => {
          prefetchInFlightRef.current.delete(slug)
        })

      prefetchInFlightRef.current.set(slug, prefetchPromise)
      return prefetchPromise
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
    let hasNavigated = false
    const navigateToTarget = () => {
      if (hasNavigated) {
        return
      }
      hasNavigated = true
      router.push(href)
    }

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
          navigateToTarget()
          transitionCleanupTimeoutRef.current = window.setTimeout(() => {
            clearTransitionElements()
          }, TRANSITION_MAX_WAIT_MS)
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
      timeline.call(() => {
        navigateToTarget()
      }, [], TRANSITION_PUSH_OFFSET_S)

      if (transitionElementsRef.current) {
        transitionElementsRef.current.timeline = timeline
      }
    } catch (error) {
      console.error('Unable to animate portrait transition', error)
      clearTransitionElements()
      router.push(href)
    }
  }

  const handleArticleClick = (event: MouseEvent<HTMLAnchorElement>, post?: Article) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    if (typeof window === 'undefined' || !post?.slug) {
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

  const handleSlideClick = (event: MouseEvent<HTMLAnchorElement>, post: Article) => {
    const allowClick = (swiperInstanceRef.current as (SwiperInstance & { allowClick?: boolean }) | null)?.allowClick
    if (allowClick === false) {
      event.preventDefault()
      event.stopPropagation()
      return
    }

    handleArticleClick(event, post)
  }

  const animateSplitText = useCallback(() => {
    const container = textBlockRef.current
    const gsapInstance = gsapRef.current
    const SplitTextCtor = splitTextCtorRef.current

    if (!container || !gsapInstance || !SplitTextCtor || !splitReadyRef.current) {
      return
    }

    textAnimationRef.current?.kill()
    splitInstancesRef.current?.forEach((instance) => {
      if (typeof instance?.revert === 'function') {
        instance.revert()
      }
    })
    splitInstancesRef.current = null

    const elements = Array.from(container.querySelectorAll<HTMLElement>('.portraits-split')).filter(
      (element) => element.offsetParent !== null
    )
    if (!elements.length) {
      return
    }

    gsapInstance.set(elements, { opacity: 1 })

    const splitOptions = {
      type: 'lines',
      linesClass: 'portrait-line-mask',
      autoSplit: true,
      mask: 'lines'
    }

    let instances: any[] = []
    if (typeof SplitTextCtor.create === 'function') {
      const createdInstances = SplitTextCtor.create(elements, splitOptions)
      instances = Array.isArray(createdInstances) ? createdInstances : [createdInstances]
    } else {
      instances = elements.map((element) => new SplitTextCtor(element, splitOptions))
    }

    splitInstancesRef.current = instances

    const lines = instances.flatMap((instance) => instance?.lines ?? [])
    if (!lines.length) {
      return
    }

    textAnimationRef.current = gsapInstance.fromTo(
      lines,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: TEXT_ANIMATION_DURATION,
        stagger: TEXT_ANIMATION_STAGGER,
        ease: 'power2.out'
      }
    )
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const isMobileViewport = window.matchMedia('(max-width: 767px)').matches

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
          isTextVisibleRef.current = entry.isIntersecting
        })
      },
      { threshold: isMobileViewport ? 0.15 : 0.5 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let isCancelled = false

    const loadSplitText = async () => {
      try {
        const [{ default: gsap }, splitModule] = await Promise.all([
          import('gsap'),
          import('gsap/SplitText')
        ])

        if (isCancelled) {
          return
        }

        const SplitTextCtor = splitModule.SplitText ?? splitModule.default
        if (!SplitTextCtor) {
          console.warn('SplitText plugin is unavailable for the portraits block')
          return
        }

        gsap.registerPlugin(SplitTextCtor)
        gsapRef.current = gsap
        splitTextCtorRef.current = SplitTextCtor

        if (typeof document !== 'undefined' && 'fonts' in document) {
          await document.fonts.ready
        }

        if (isCancelled) {
          return
        }

        splitReadyRef.current = true
        if (isTextVisibleRef.current) {
          animateSplitText()
        }
      } catch (error) {
        console.error('Unable to initialize SplitText for the portraits block', error)
      }
    }

    loadSplitText()

    return () => {
      isCancelled = true
      textAnimationRef.current?.kill()
      textAnimationRef.current = null
      splitInstancesRef.current?.forEach((instance) => {
        if (typeof instance?.revert === 'function') {
          instance.revert()
        }
      })
      splitInstancesRef.current = null
    }
  }, [animateSplitText])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    animateSplitText()
  }, [isVisible, animateSplitText])

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

  const slides = useMemo(() => posts, [posts])
  const activePost = useMemo(() => slides[currentIndex] ?? slides[0], [slides, currentIndex])
  const localisationLabel = useMemo(() => buildLocalisationLabel(activePost) ?? '', [activePost])
  const excerpt = useMemo(
    () =>
      sanitizeExcerptText(activePost?.excerpt ?? activePost?.optionsArticles?.champsLibrePageAccueil ?? '', {
        preserveLineBreaks: true
      }),
    [activePost]
  )
  const excerptLines = useMemo(() => {
    if (!excerpt) {
      return []
    }
    return excerpt.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  }, [excerpt])
  useEffect(() => {
    const element = textAnimatedBlockRef.current
    if (!element) {
      return
    }

    const isMobileViewport = window.matchMedia('(max-width: 767px)').matches
    if (isMobileViewport) {
      setIsTextBlockVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTextBlockVisible(entry.isIntersecting)
      },
      { threshold: 0.25 }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [activePost?.slug])

  if (!slides.length) {
    return null
  }

  const textBlockTransition: CSSProperties = { transitionDelay: isTextBlockVisible ? '480ms' : '0ms' }
  const textVisibilityClass = isVisible ? 'portraits-text-visible' : 'portraits-text-hidden'
  const carouselVisibilityClass = isVisible ? 'portraits-carousel-visible' : 'portraits-carousel-hidden'
  const viewAllHref = link?.url ?? (categorySlug ? `/categories/${categorySlug}` : '/articles')
  const viewAllLabel = link?.title ?? 'Voir tout'
  const viewAllTarget = link?.target ?? undefined
  const viewAllRel = viewAllTarget === '_blank' ? 'noreferrer' : undefined
  const imageWrapperClass = 'relative w-full min-w-[260px] aspect-[3/2] overflow-hidden'

  return (
    <div
      ref={containerRef}
      className={clsx(
        'bloc-portrait relative md:pb-20 md:pt-20 lg:pb-24',
        'md:mb-40 transition-colors duration-500 lg:mb-0 bg-white'
      )}
    >
      <div ref={textBlockRef} className="mx-auto flex w-full flex-col gap-12 px-6 sm:px-10 lg:px-0 md:flex-row lg:items-start">
        <div className="order-1 w-full md:hidden">
          <h2 className={clsx('portraits-split text-[3rem] font-schnyder_wide_xl_webdemi leading-[0.95]', textVisibilityClass)}>
            {titreDeLaSection}
          </h2>
        </div>
        <div
          className="order-2 flex w-full flex-col justify-center md:order-1 md:w-1/2"
          style={{ marginLeft: 'calc((100vw - 100%) / -2)' }}
        >
          <div className={clsx('portrait-slider-wrapper awot-carousel-nav-host relative transition-all duration-700', carouselVisibilityClass)}>
            <Swiper
              dir="rtl"
              modules={[Navigation, Pagination, Mousewheel, HashNavigation]}
              grabCursor={true}
              slidesPerView={1.2}
              spaceBetween={16}
              loop={true}
              navigation={{ prevEl: '.swiper-button-prev-portrait', nextEl: '.swiper-button-next-portrait' }}
              breakpoints={{
                640: { slidesPerView: 1.2, spaceBetween: 18 },
                768: { slidesPerView: 1.2, spaceBetween: 20 },
                1024: { slidesPerView: 1.2, spaceBetween: 20 }
              }}
              mousewheel={{
                forceToAxis: true,
                releaseOnEdges: true,
                thresholdDelta: 24,
                thresholdTime: 420,
                sensitivity: 0.6
              }}
              preventClicks={true}
              preventClicksPropagation={true}
              onSwiper={(instance) => {
                swiperInstanceRef.current = instance
              }}
              onSlideChange={(swiper) => {
                const nextIndex = typeof swiper.realIndex === 'number' ? swiper.realIndex : swiper.activeIndex
                setCurrentIndex(nextIndex ?? 0)
              }}
              className="portrait-slider awot-carousel-cursor w-full"
            >
              {slides.map((post, index) => {
                const imageNode =
                  post.optionsArticles?.imagePaysage?.node ??
                  post.optionsArticles?.imagePortait?.node ??
                  post.featuredImage?.node
                const imageSrc = imageNode?.sourceUrl ?? imageNode?.guid ?? null
                const isActive = currentIndex === index
                const postHref = post.slug ? `/articles/${post.slug}` : '#'

                const itemDelay = CAROUSEL_BASE_DELAY + index * CAROUSEL_STAGGER_DELAY

                return (
                  <SwiperSlide key={post.slug ?? index} className="relative">
                    <Link
                      href={postHref}
                      className="block"
                      aria-label={`Voir l'article ${toAccessibleLabel(post.title)}`}
                      onClick={(event) => handleSlideClick(event, post)}
                      onPointerEnter={() => {
                        void prefetchArticle(post.slug)
                      }}
                      onFocus={() => {
                        void prefetchArticle(post.slug)
                      }}
                    >
                      {imageSrc ? (
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
                          className={clsx(
                            imageWrapperClass,
                            'transition-transform duration-700 ease-out',
                            isActive ? 'scale-100' : 'scale-[0.95] opacity-80',
                            isVisible ? 'portraits-carousel-slide--visible' : 'portraits-carousel-slide--hidden'
                          )}
                          style={isVisible ? { transitionDelay: `${itemDelay}ms` } : undefined}
                        >
                          <Image
                            src={imageSrc}
                            alt={imageNode?.altText ?? post.title}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1280px) 45vw, (min-width: 768px) 60vw, 100vw"
                          />
                        </div>
                      ) : null}
                    </Link>
                  </SwiperSlide>
                )
              })}
              {viewAllHref ? (
                <SwiperSlide key="view-all" data-hash={slugify(viewAllLabel)} data-view-all="true" className="relative">
                  <Link
                    href={viewAllHref}
                    target={viewAllTarget}
                    rel={viewAllRel}
                    className={clsx('relative block h-full w-full overflow-hidden', imageWrapperClass)}
                  >
                    <div className="flex h-full w-full items-center justify-center border border-black bg-black text-white transition-colors duration-300 hover:bg-white hover:text-black hover:border-none">
                      <span className="font-montserrat text-xs uppercase tracking-[0.3em]">
                        {viewAllLabel}
                      </span>
                    </div>
                  </Link>
                </SwiperSlide>
              ) : null}
              <div className="awot-carousel-nav">
                <button
                  type="button"
                  aria-label="Image précédente"
                  className="swiper-button-prev-portrait awot-carousel-nav-button"
                >
                  <span aria-hidden="true" className="awot-carousel-nav-icon">&lt;</span>
                </button>
                <button
                  type="button"
                  aria-label="Image suivante"
                  className="swiper-button-next-portrait awot-carousel-nav-button"
                >
                  <span aria-hidden="true" className="awot-carousel-nav-icon">&gt;</span>
                </button>
              </div>
            </Swiper>
          </div>
        </div>
        <div
          id="portraits"
          className={clsx('order-3 flex w-full flex-col justify-center md:order-2 md:w-1/2 text-black')}
        >
          <div className={clsx('flex flex-col gap-[4rem] overflow-hidden transition-all duration-700', textVisibilityClass)}>
            <h2 className={clsx('portraits-split hidden text-[3rem] font-schnyder_wide_xl_webdemi leading-[0.95] md:block lg:text-[4.5vw] lg:mb-3rem', textVisibilityClass)}>
              {titreDeLaSection}
            </h2>
            <div
              key={activePost?.slug ?? currentIndex}
              ref={textAnimatedBlockRef}
              style={textBlockTransition}
              className={clsx(
                'portraits-text-animated-block flex flex-col gap-4 text-current md:max-w-[32vw]',
                'transform transition-all duration-700 ease-out',
                isTextBlockVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
              )}
            >
              {localisationLabel ? (
                <span
                  key={`category-${activePost?.slug ?? currentIndex}`}
                  className="font-brandon_grotesquelight_italic uppercase tracking-[0.2em] -mb-4 opacity-70 md:text-[16px] text-[2.5vw]"
                >
                  {localisationLabel}
                </span>
              ) : null}
              <Link
                key={`title-${activePost?.slug ?? currentIndex}`}
                href={activePost?.slug ? `/articles/${activePost.slug}` : '#'}
                className="group"
                onClick={(event) => handleArticleClick(event, activePost)}
                onPointerEnter={() => {
                  void prefetchArticle(activePost?.slug)
                }}
                onFocus={() => {
                  void prefetchArticle(activePost?.slug)
                }}
              >
                <h3
                  className={clsx(
                    'font-schnyder_xl_webdemi text-[30px] md:text-[2.5vw] leading-tight transition duration-300 group-hover:opacity-70'
                  )}
                  dangerouslySetInnerHTML={{ __html: sanitizePostTitleHtml(activePost?.title) }}
                />
              </Link>
              {excerptLines.length
                ? excerptLines.map((line, idx) => (
                    <p
                      key={`${activePost?.slug ?? currentIndex}-line-${idx}`}
                      className="font-montserrat text-sm opacity-80"
                    >
                      {line}
                    </p>
                  ))
                : null}
              <Link
                key={`cta-${activePost?.slug ?? currentIndex}`}
                href={activePost?.slug ? `/articles/${activePost.slug}` : '#'}
                className="text-xs uppercase tracking-[0.2em] text-current hover:italic"
                onClick={(event) => handleArticleClick(event, activePost)}
                onPointerEnter={() => {
                  void prefetchArticle(activePost?.slug)
                }}
                onFocus={() => {
                  void prefetchArticle(activePost?.slug)
                }}
              >
                Découvrir <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .portrait-slider .swiper-wrapper {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-content: flex-end;
        }
        .portrait-slider {
          overflow: visible;
        }
        #portraits .portraits-split {
          opacity: 0;
        }
        .portraits-text-animated-block {
          will-change: transform, opacity;
        }
        @media (max-width: 767px) {
          #portraits .portraits-text-animated-block {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
        }
        .portrait-line-mask {
          display: block;
          overflow: hidden;
        }
        .portraits-text-hidden {
          opacity: 0;
          visibility: hidden;
          transform: translateY(40px);
        }
        .portraits-text-visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        @media (max-width: 767px) {
          .portraits-text-hidden {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
        }
        .portraits-carousel-hidden {
          opacity: 0;
          transform: translateY(40px);
        }
        .portraits-carousel-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .portrait-slider-wrapper {
          position: relative;
        }
        .portrait-slider-fade {
          position: absolute;
          top: 0;
          bottom: 0;
          width: min(140px, 25vw);
          pointer-events: none;
          z-index: 2;
        }
        .portrait-slider-fade--left {
          left: 0;
          background: linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
        }
        .portrait-slider-fade--right {
          right: 0;
          background: linear-gradient(270deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
        }
        .portraits-carousel-slide {
          opacity: 0;
          transform: translateX(-60px);
          will-change: transform, opacity;
        }
        .portraits-carousel-slide--visible {
          opacity: 1;
          //transform: translateX(0);
        }
        .portraits-carousel-slide--hidden {
          opacity: 0;
          //transform: translateX(-60px);
        }
      `}</style>
      <style jsx global>{`
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
