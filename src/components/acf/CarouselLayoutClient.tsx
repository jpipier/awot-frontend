'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import type { Article } from '@/types/wordpress'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const UNIFORM_HEIGHT_TITLES = new Set(['food', 'hebergement', 'hebergements', 'voyage', 'voyages'])

interface CarouselLayoutClientProps {
  posts: Article[]
  titreDeLaSection?: string | null
  headline?: string | null
  contenu?: string | null
  postParPage: number
}

export default function CarouselLayoutClient({
  posts,
  titreDeLaSection,
  headline,
  contenu,
  postParPage
}: CarouselLayoutClientProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [isTitleVisible, setIsTitleVisible] = useState(false)
  const [isHeadlineVisible, setIsHeadlineVisible] = useState(false)
  const [isContentVisible, setIsContentVisible] = useState(false)
  const [titleScrollProgress, setTitleScrollProgress] = useState(0)
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const headlineTransition: CSSProperties = { transitionDelay: isHeadlineVisible ? '80ms' : '0ms' }
  const titleTransition: CSSProperties = { transitionDelay: isTitleVisible ? '120ms' : '0ms' }
  const contentTransition: CSSProperties = { transitionDelay: isContentVisible ? '480ms' : '0ms' }

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
  const titleScrollEnabled = normalizedTitle === 'hebergements'
  const useUniformHeights = normalizedTitle ? UNIFORM_HEIGHT_TITLES.has(normalizedTitle) : false
  const imageWrapperHeightClass = useUniformHeights
    ? 'h-[320px] md:h-[420px] lg:h-[480px] 3xl:h-[540px]'
    : 'h-[275px] md:h-[500px] lg:h-[490px] 3xl:h-[590px]'

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

  const headlineStartOffset = isBonnesAdressesHeadline ? -300 : -80
  const titleStartOffset = isBonnesAdressesHeadline ? -320 : -90
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
  const computedHeadlineStyle: CSSProperties = titleScrollEnabled
    ? { ...headlineTransition, transform: `translateY(${headlineScrollOffset}px)` }
    : headlineTransition
  const computedTitleStyle: CSSProperties = titleScrollEnabled
    ? { ...titleTransition, transform: `translateY(${titleScrollOffset}px)` }
    : titleTransition
  const baseTitleClass = 'font-schnyder_wide_xl_webdemi text-4xl leading-tight lg:text-[5rem] text-left'
  const easingClass = titleScrollEnabled
    ? 'transform will-change-transform transition-opacity duration-500 ease-out'
    : 'transform transition-all duration-700 ease-out'
  const visibilityClass = isTitleVisible ? 'opacity-100' : 'opacity-0'
  const translateClass =
    titleScrollEnabled || !titreDeLaSection
      ? ''
      : isTitleVisible
        ? 'translate-y-0'
        : '-translate-y-16'
  const titleClassName = [baseTitleClass, easingClass, visibilityClass, translateClass].filter(Boolean).join(' ')
  const baseHeadlineClass = 'text-sm font-light uppercase tracking-wide text-gray-600 -mb-[2rem]'
  const headlineEasingClass = titleScrollEnabled
    ? 'transform will-change-transform transition-opacity duration-500 ease-out'
    : 'transform transition-all duration-700 ease-out'
  const headlineVisibilityClass = isHeadlineVisible ? 'opacity-100' : 'opacity-0'
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

  return (
    <div ref={sectionRef} className="mx-auto max-w-screen-full overflow-hidden">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-end">
        <div
          className={`flex w-full flex-col gap-6 px-4 text-left pb-[3rem] ${
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
              className={`text-sm font-extralight font-montserrat transform transition-all duration-700 ease-out ${
                isContentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
              }`}
              dangerouslySetInnerHTML={{ __html: contenu }}
            />
          ) : null}
        </div>
        <div className={`w-full overflow-hidden lg:pl-0 ${postParPage > 2 ? 'lg:w-3/5' : 'lg:w-2/5'}`}>
          <Swiper
            modules={[Navigation, Pagination]}
            className="mySwiper"
            slidesPerView={1.2}
            spaceBetween={20}
            breakpoints={{
              640: { slidesPerView: 1.5, spaceBetween: 20 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1024: {
                slidesPerView: postParPage > 2 ? 2.5 : 1.5,
                spaceBetween: 20
              }
            }}
          >
            {posts.map((post) => (
              <SwiperSlide key={post.slug} className="carousel-item">
                <div className="group relative">
                  <Link href={`/articles/${post.slug}`} className="block">
                    {post.optionsArticles?.imagePortait?.node?.guid ? (
                      <div className={`relative w-full overflow-hidden ${imageWrapperHeightClass}`}>
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
                        className="mb-0 text-[0.5rem] uppercase font-montserrat italic text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html: post.optionsArticles?.champsLibrePageAccueil ?? ''
                        }}
                      />
                      <h3 className="text-xs uppercase font-montserrat font-medium ">{post.title}</h3>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  )
}
