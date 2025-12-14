'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
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

const TEXT_ANIMATION_DURATION = 1.8
const TEXT_ANIMATION_STAGGER = 0.24
const CAROUSEL_BASE_DELAY = 300
const CAROUSEL_STAGGER_DELAY = 140

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
  const [isTextBlockVisible, setIsTextBlockVisible] = useState(false)
  const textBlockRef = useRef<HTMLDivElement | null>(null)
  const textAnimatedBlockRef = useRef<HTMLDivElement | null>(null)
  const slideImageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const gsapRef = useRef<any>(null)
  const splitTextCtorRef = useRef<any>(null)
  const splitInstancesRef = useRef<Array<{ revert: () => void }> | null>(null)
  const textAnimationRef = useRef<any>(null)
  const splitReadyRef = useRef(false)
  const isTextVisibleRef = useRef(false)

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

    const elements = Array.from(container.querySelectorAll('.portraits-split'))
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
          isTextVisibleRef.current = entry.isIntersecting
        })
          },
          { threshold: 0.5 }
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
  }, [isVisible, currentIndex, animateSplitText])

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
  useEffect(() => {
    const element = textAnimatedBlockRef.current
    if (!element) {
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

  return (
    <div
      ref={containerRef}
      className={clsx(
        'bloc-portrait relative md:pb-20 md:pt-20 lg:pb-24',
        'md:mb-40 transition-colors duration-500 lg:mb-0 bg-white'
      )}
    >
      <div className="mx-auto flex w-full flex-col gap-12 px-6 sm:px-10 lg:px-0 md:flex-row lg:items-start">
        <div
          className="order-1 flex w-full flex-col justify-center md:w-1/2"
          style={{ marginLeft: 'calc((100vw - 100%) / -2)' }}
        >
          <div className={clsx('portrait-slider-wrapper relative transition-all duration-700', carouselVisibilityClass)}>
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

                const itemDelay = CAROUSEL_BASE_DELAY + index * CAROUSEL_STAGGER_DELAY

                return (
                  <SwiperSlide key={post.slug ?? index} className="relative">
                    <Link href={postHref} className="block">
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
                            'relative w-full min-w-[260px] rounded overflow-hidden transition-transform duration-700 ease-out',
                            'h-[220px] sm:h-[260px] md:h-[300px] lg:h-[340px] xl:h-[380px]',
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
                            unoptimized
                          />
                        </div>
                      ) : null}
                    </Link>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          </div>
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
          id="portraits"
          ref={textBlockRef}
          className={clsx('order-2 flex w-full flex-col justify-center md:w-1/2 text-black')}
        >
          <div className={clsx('flex flex-col gap-10 overflow-hidden transition-all duration-700', textVisibilityClass)}>
            <h2 className={clsx('portraits-split text-[3rem] font-schnyder_wide_xl_webdemi leading-[0.95] lg:text-[4.5vw] lg:mb-3rem', textVisibilityClass)}>
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
              {categoryLabel ? (
                <span
                  key={`category-${activePost?.slug ?? currentIndex}`}
                  className="font-brandon_grotesquelight_italic uppercase tracking-[0.3em] -mb-4 opacity-70"
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
                  className={clsx(
                    'font-schnyder_xl_webdemi text-[2.5vw] leading-tight transition duration-300 group-hover:opacity-70'
                  )}
                >
                  {activePost?.title}
                </h3>
              </Link>
              {excerptLines.length
                ? excerptLines.map((line, idx) => (
                    <p
                      key={`${activePost?.slug ?? currentIndex}-line-${idx}`}
                      className="font-montserrat lato-montserrat text-sm opacity-80"
                    >
                      {line}
                    </p>
                  ))
                : null}
              <Link
                key={`cta-${activePost?.slug ?? currentIndex}`}
                href={activePost?.slug ? `/articles/${activePost.slug}` : '#'}
                className="text-xs uppercase tracking-[0.2em] text-current"
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
        #portraits .portraits-split {
          opacity: 0;
        }
        .portraits-text-animated-block {
          will-change: transform, opacity;
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
    </div>
  )
}
