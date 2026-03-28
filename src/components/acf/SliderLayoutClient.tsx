'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade } from 'swiper/modules'
import Search from '@/components/search/Search'

import 'swiper/css'
import 'swiper/css/effect-fade'

interface SlideItem {
  img?: {
    node?: {
      guid?: string | null
    }
  }
  slug?: {
    url?: string | null
    title?: string | null
  }
  sousTitre?: string | null
  titre?: string | null
  headline?: string | null
  afficherDuTexte?: boolean | null
}

interface SliderLayoutClientProps {
  slides: SlideItem[]
  siteTitle: string
  siteDescription: string
}

const MOBILE_MEDIA_QUERY = '(max-width: 767px)'
const DESKTOP_HERO_QUALITY = 55
const MOBILE_HERO_QUALITY = 40

export default function SliderLayoutClient({ slides, siteTitle, siteDescription }: SliderLayoutClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const initialProgress = useRef<number | null>(null)
  const [parallaxProgress, setParallaxProgress] = useState(0)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [loadedSlideIndexes, setLoadedSlideIndexes] = useState<Set<number>>(() => new Set([0]))
  const loop = slides.length > 1 && !isMobileViewport
  const shouldAutoplay = slides.length > 1 && !isMobileViewport
  const heroQuality = isMobileViewport ? MOBILE_HERO_QUALITY : DESKTOP_HERO_QUALITY

  const markSlideAsLoaded = useCallback((index: number) => {
    setLoadedSlideIndexes((prev) => {
      if (prev.has(index)) {
        return prev
      }
      const next = new Set(prev)
      next.add(index)
      return next
    })
  }, [])

  const markSlideAndNeighborAsLoaded = useCallback(
    (index: number) => {
      if (!slides.length) {
        return
      }
      const normalizedIndex = ((index % slides.length) + slides.length) % slides.length
      const nextIndex = (normalizedIndex + 1) % slides.length
      markSlideAsLoaded(normalizedIndex)
      markSlideAsLoaded(nextIndex)
    },
    [markSlideAsLoaded, slides.length]
  )

  useEffect(() => {
    const updateProgress = () => {
      const container = containerRef.current
      if (!container) {
        return
      }
      const rect = container.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1
      const totalDistance = rect.height + viewportHeight
      const distance = viewportHeight - rect.top
      const progress = Math.min(Math.max(distance / totalDistance, 0), 1)

      if (initialProgress.current === null) {
        initialProgress.current = progress
      }

      // Use the initial measurement as the baseline so the image starts at translate3d(0, 0, 0)
      const start = initialProgress.current ?? 0
      const range = 1 - start
      const normalizedProgress = range <= 0 ? 0 : (progress - start) / range
      const clampedNormalizedProgress = Math.min(Math.max(normalizedProgress, 0), 1)

      setParallaxProgress(clampedNormalizedProgress)
    }

    let frame = 0
    const handleScroll = () => {
      if (frame) {
        return
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateProgress()
      })
    }

    updateProgress()
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

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
    const updateViewportMode = () => {
      setIsMobileViewport(mediaQuery.matches)
    }

    updateViewportMode()
    mediaQuery.addEventListener('change', updateViewportMode)
    return () => {
      mediaQuery.removeEventListener('change', updateViewportMode)
    }
  }, [])

  useEffect(() => {
    setLoadedSlideIndexes(new Set([0]))
  }, [slides.length])

  const clampedProgress = Math.min(Math.max(parallaxProgress, 0), 1)
  const parallaxImageOffset = clampedProgress * -200
  const parallaxImageScale = 1 + clampedProgress * 0.02
  const parallaxImageStyle: CSSProperties = {
    transform: `translate3d(0, ${parallaxImageOffset}px, 0) scale(${parallaxImageScale})`,
    transition: 'transform 0.45s ease-out'
  }

  return (
    <div ref={containerRef} data-home-hero-slider className="relative h-[85vh] w-full">
      <div className="absolute left-1/2 top-1/4 z-20 w-full max-w-full -translate-x-1/2">
        <div className="mb-[10vh] mt-[-5vh] text-center text-white">
          <h1 className="font-custom text-[45pt] lg:text-[103pt]">{siteTitle}</h1>
          <p className="font-montserrat text-[8pt] uppercase lg:text-[8pt] -mt-[1rem] tracking-wider">{siteDescription}</p>
          <div className="mt-10 max-w-2xl mx-auto">
            <Search />
          </div>
        </div>
      </div>
      <Swiper
        modules={[Autoplay, EffectFade]}
        slidesPerView={1}
        spaceBetween={0}
        loop={loop}
        preventClicks={false}
        preventClicksPropagation={false}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1200}
        autoplay={shouldAutoplay ? { delay: 3000, disableOnInteraction: false } : false}
        onSwiper={(instance) => {
          const initialIndex = typeof instance.realIndex === 'number' ? instance.realIndex : instance.activeIndex
          markSlideAndNeighborAsLoaded(initialIndex ?? 0)
        }}
        onSlideChange={(instance) => {
          const nextIndex = typeof instance.realIndex === 'number' ? instance.realIndex : instance.activeIndex
          markSlideAndNeighborAsLoaded(nextIndex ?? 0)
        }}
        className="h-[85vh]"
      >
        {slides.map((slide, index) => {
          const imageSrc = slide.img?.node?.guid
          if (!imageSrc) {
            return null
          }
          const shouldLoadImage = index === 0 || loadedSlideIndexes.has(index)
          const content = (
            <div className="relative h-screen overflow-hidden">
              <div className="absolute inset-0">
                {shouldLoadImage ? (
                  <Image
                    src={imageSrc}
                    alt={slide.titre ?? `Slide ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 1280px, 100vw"
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    quality={heroQuality}
                    style={parallaxImageStyle}
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-200" aria-hidden="true" />
                )}
              </div>
              {slide.afficherDuTexte ? (
                <div className="absolute inset-0 -top-[15vw] flex flex-col items-center justify-center text-center text-white">
                  <p className="font-montserrat mb-6 text-xs uppercase after:mt-2 after:block after:-ml-[30%] after:h-[1px] after:w-[160%] after:bg-white">
                    {slide.headline}
                  </p>
                  <h2 className="font-schnyder_wide_xl_webdemi text-5xl text-white lg:text-9xl">
                    {slide.titre}
                  </h2>
                  <p className="text-lg uppercase">{slide.sousTitre}</p>
                </div>
              ) : null}
            </div>
          )

          if (slide.afficherDuTexte && slide.slug?.url) {
            const isInternal = slide.slug.url.startsWith('/')
            return (
              <SwiperSlide key={index}>
                {isInternal ? (
                  <Link href={slide.slug.url}>{content}</Link>
                ) : (
                  <a href={slide.slug.url} target="_blank" rel="noreferrer">
                    {content}
                  </a>
                )}
              </SwiperSlide>
            )
          }

          return (
            <SwiperSlide key={index}>{content}</SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
