'use client'

import { useEffect, useRef, useState, type CSSProperties, type ComponentPropsWithoutRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectFade, Navigation, Pagination } from 'swiper/modules'
import type { Article } from '@/types/wordpress'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface GuideLayoutClientProps {
  posts: Article[]
  link?: {
    title?: string | null
    url?: string | null
  }
  titreDeLaSection?: string | null
}

function AnimatedGuideTitle({
  className,
  delay = 120,
  children,
  ...props
}: ComponentPropsWithoutRef<'h3'> & { delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    const element = headingRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.25 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const style: CSSProperties = { transitionDelay: isVisible ? `${delay}ms` : '0ms' }
  const baseClasses = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
  const combinedClasses = `transform transition-all duration-700 ease-out ${baseClasses}${
    className ? ` ${className}` : ''
  }`

  return (
    <h3 ref={headingRef} style={style} className={combinedClasses} {...props}>
      {children}
    </h3>
  )
}

function AnimatedGuideSubtitle({
  className,
  delay = 220,
  children,
  ...props
}: ComponentPropsWithoutRef<'h4'> & { delay?: number }) {
  const [isVisible, setIsVisible] = useState(false)
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  useEffect(() => {
    const element = headingRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.25 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const style: CSSProperties = { transitionDelay: isVisible ? `${delay}ms` : '0ms' }
  const baseClasses = isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16'
  const combinedClasses = `transform transition-all duration-700 ease-out ${baseClasses}${
    className ? ` ${className}` : ''
  }`

  return (
    <h4 ref={headingRef} style={style} className={combinedClasses} {...props}>
      {children}
    </h4>
  )
}

export default function GuideLayoutClient({ posts, link, titreDeLaSection }: GuideLayoutClientProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const targetRef = useRef<HTMLElement | null>(null)
  const lastOffsetRef = useRef(0)
  const previousSectionRef = useRef<HTMLElement | null>(null)
  const isPrevFixedRef = useRef(false)
  const initialLiftRef = useRef(0)
  const initialScrollYRef = useRef(0)

  const togglePreviousSectionFixed = (shouldFix: boolean, lift = 0, scrollY = 0) => {
    const prev = previousSectionRef.current
    if (!prev) {
      return
    }
    if (shouldFix && !isPrevFixedRef.current) {
      initialLiftRef.current = lift
      initialScrollYRef.current = scrollY
      prev.style.position = 'sticky'
      prev.style.top = '0px'
      prev.style.zIndex = '0'
      prev.style.willChange = 'transform'
      isPrevFixedRef.current = true
    } else if (shouldFix && isPrevFixedRef.current) {
      const deltaFromLift = Math.max(lift - initialLiftRef.current, 0)
      const deltaFromScroll = Math.abs(scrollY - initialScrollYRef.current)
      const delta = Math.max(deltaFromLift, deltaFromScroll)
      prev.style.top = `${-delta * 0.3}px`
    } else if (!shouldFix && isPrevFixedRef.current) {
      // keep the last applied styles so the transition remains smooth even after leaving viewport
      isPrevFixedRef.current = false
      initialLiftRef.current = 0
      initialScrollYRef.current = 0
    }
  }

  useEffect(() => {
    const current = sectionRef.current
    if (!current) {
      return
    }
    const target =
      current.closest<HTMLElement>('section[id^="section-homepageblocsguidelayout"]') ?? current
    targetRef.current = target
    target.style.position = target.style.position || 'relative'
    target.style.zIndex = target.style.zIndex || '0'
    previousSectionRef.current = target.previousElementSibling as HTMLElement | null

    return () => {
      if (targetRef.current === target) {
        target.style.transform = ''
        if (target.style.zIndex === '0') {
          target.style.zIndex = ''
        }
        if (target.style.position === 'relative') {
          target.style.position = ''
        }
        targetRef.current = null
      }
      const prev = previousSectionRef.current
      if (prev) {
        prev.style.position = ''
        prev.style.top = ''
        prev.style.zIndex = ''
        prev.style.willChange = ''
      }
      previousSectionRef.current = null
      isPrevFixedRef.current = false
    }
  }, [])

  useEffect(() => {
    const SPEED_FACTOR = 2
    let frame = 0

    const updateOffset = () => {
      frame = 0

      const node = targetRef.current ?? sectionRef.current
      if (!node) {
        return
      }

      const rect = node.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1
      const offsetMultiplier = (SPEED_FACTOR - 1) / SPEED_FACTOR
      let targetOffset = 0
      if (rect.top >= viewportHeight) {
        targetOffset = -(rect.top - viewportHeight) * offsetMultiplier
      } else if (rect.bottom <= 0) {
        targetOffset = (0 - rect.bottom) * offsetMultiplier
      }
      const shouldFixPrevious = rect.top <= viewportHeight && rect.bottom >= 0
      const liftAmount =
        rect.top >= viewportHeight ? Math.max(viewportHeight - rect.top, 0) : 0
      const currentScrollY = window.scrollY || window.pageYOffset || 0

      if (Math.abs(lastOffsetRef.current - targetOffset) < 0.5) {
        togglePreviousSectionFixed(shouldFixPrevious, liftAmount, currentScrollY)
        return
      }
      lastOffsetRef.current = targetOffset
      node.style.transform = `translate3d(0, ${targetOffset}px, 0)`
      node.style.willChange = 'transform'
      togglePreviousSectionFixed(shouldFixPrevious, liftAmount, currentScrollY)
    }

    const handleScroll = () => {
      if (frame) {
        return
      }
      frame = window.requestAnimationFrame(updateOffset)
    }

    updateOffset()
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

  return (
    <section ref={sectionRef} className="max-w-screen-full bg-zinc-900">
      <div className="flex flex-col items-center px-6 sm:px-10 lg:px-0 lg:h-[80vh] lg:flex-row">
        <div className="relative w-full lg:w-10/12">
          <Swiper
            modules={[Navigation, Pagination, EffectFade]}
            className="mySwiper"
            slidesPerView={1}
            spaceBetween={20}
            effect="fade"
            pagination={{ clickable: true, el: '.custom-pagination' }}
            navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
          >
            {posts.map((post) => (
              <SwiperSlide key={post.slug} className="carousel-item">
                <div className="relative">
                  <Link href={`/articles/${post.slug}`} className="block">
                    {post.optionsArticles?.imagePaysage?.node?.guid ? (
                      <div className="relative h-[500px] w-full md:h-[450px] lg:h-[80vh]">
                        <Image
                          src={post.optionsArticles.imagePaysage.node.guid}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 75vw, 100vw"
                          unoptimized
                        />
                      </div>
                    ) : null}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                      <AnimatedGuideTitle className="font-schnyder_wide_xl_webdemi text-2xl md:text-4xl lg:text-6xl">
                        {post.title}
                      </AnimatedGuideTitle>
                      <AnimatedGuideSubtitle className="mt-4 text-sm uppercase font-montserrat">
                        {post.optionsArticles?.champsLibrePageAccueil}
                      </AnimatedGuideSubtitle>
                    </div>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-button-prev" />
          <div className="swiper-button-next" />
          <div className="custom-pagination" />
        </div>
        {link?.url ? (
          <div className="my-6 flex w-full items-center justify-center lg:my-0 lg:w-2/12">
            <a
              href={link.url}
              className="transform rounded-md px-4 py-2 text-sm uppercase text-white font-montserrat lg:-rotate-90"
              target="_blank"
              rel="noreferrer"
            >
              {link.title ?? 'En savoir plus'}
            </a>
          </div>
        ) : null}
      </div>
      <style jsx>{`
        .swiper-button-next,
        .swiper-button-prev {
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 20px;
          font-weight: bold;
        }
        .custom-pagination {
          position: absolute;
          left: 0;
          width: 100%;
          z-index: 10;
          bottom: 8px;
          text-align: center;
          transition: 300ms opacity;
          transform: translate3d(0, 0, 0);
        }
        :global(.custom-pagination .swiper-pagination-bullet) {
          background: rgba(0, 0, 0, 1) !important;
          transition: width 0.3s ease, background-color 0.3s ease;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        :global(.custom-pagination .swiper-pagination-bullet-active) {
          background: #ffffff !important;
          width: 25px;
          border-radius: 10px;
        }
      `}</style>
    </section>
  )
}
