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

type GSAPMatchMedia = import('gsap').MatchMedia

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
  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (prefersReducedMotion.matches) {
      return
    }

    let mm: GSAPMatchMedia | undefined
    let isCancelled = false

    const setupAnimation = async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger')
        ])

        if (!sectionRef.current || isCancelled) {
          return
        }

        gsap.registerPlugin(ScrollTrigger)
        mm = gsap.matchMedia()
        mm.add('(min-width: 1024px)', () => {
          const node = sectionRef.current
          if (!node) {
            return undefined
          }

          return gsap.to(node, {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true
            }
          })
        })
      } catch (error) {
        console.error('Unable to initialize guide ScrollSmoother animation', error)
      }
    }

    setupAnimation()

    return () => {
      isCancelled = true
      mm?.revert()
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
