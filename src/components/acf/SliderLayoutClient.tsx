'use client'

import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
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

const HERO_QUALITY = 55

export default function SliderLayoutClient({ slides, siteTitle, siteDescription }: SliderLayoutClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const initialProgress = useRef<number | null>(null)
  const [parallaxProgress, setParallaxProgress] = useState(0)
  const loop = slides.length > 1

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

  const clampedProgress = Math.min(Math.max(parallaxProgress, 0), 1)
  const parallaxImageOffset = clampedProgress * -200
  const parallaxImageScale = 1 + clampedProgress * 0.02
  const parallaxImageStyle: CSSProperties = {
    transform: `translate3d(0, ${parallaxImageOffset}px, 0) scale(${parallaxImageScale})`,
    transition: 'transform 0.45s ease-out'
  }

  return (
    <div ref={containerRef} data-home-hero-slider className="home-hero relative w-full">
      <div className="home-hero-brand absolute left-1/2 z-20 w-full -translate-x-1/2 px-6 text-center text-white">
          <h1 className="home-hero-title font-schnyderCondensed font-light uppercase">
            {siteTitle.split('&').map((part, index) => (
              <Fragment key={index}>
                {index > 0 && (
                  <span className="home-hero-ampersand inline-block align-baseline">&</span>
                )}
                {part.trim()}
              </Fragment>
            ))}
          </h1>
          <p className="home-hero-baseline font-brandonRegular uppercase">
            {siteDescription} <span className="whitespace-nowrap">(Et plus loin...)</span>
          </p>
          <div className="home-hero-search mx-auto">
            <Search variant="hero" />
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
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="h-full"
      >
        {slides.map((slide, index) => {
          const imageSrc = slide.img?.node?.guid
          if (!imageSrc) {
            return null
          }
          const content = (
            <div className="relative h-full overflow-hidden">
              <div className="absolute inset-0">
                <Image
                  src={imageSrc}
                  alt={slide.titre ?? `Slide ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 1280px, 100vw"
                  priority={index === 0}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  quality={HERO_QUALITY}
                  style={parallaxImageStyle}
                />
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
