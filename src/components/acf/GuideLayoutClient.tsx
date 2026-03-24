'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ComponentPropsWithoutRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, Mousewheel, HashNavigation } from 'swiper/modules'
import type { Swiper as SwiperClass } from 'swiper/types'
import type { Article } from '@/types/wordpress'
import { sanitizePostTitleHtml } from '@/lib/sanitize-post-title-html'

import 'swiper/css'
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

const AUTOPLAY_DELAY_MS = 2500

const slugify = (str: string) =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

    
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
        if (entry.intersectionRatio >= 0.95) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: [0, 0.5, 0.75, 0.95, 1] }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const style: CSSProperties = {
    transitionDelay: isVisible ? `${delay}ms` : '0ms',
    visibility: isVisible ? 'visible' : 'hidden'
  }
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
        if (entry.intersectionRatio >= 0.95) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: [0, 0.5, 0.75, 0.95, 1] }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  const style: CSSProperties = {
    transitionDelay: isVisible ? `${delay}ms` : '0ms',
    visibility: isVisible ? 'visible' : 'hidden'
  }
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
  const sliderShellRef = useRef<HTMLDivElement | null>(null)
  const swiperInstanceRef = useRef<SwiperClass | null>(null)
  const [autoplayEnabled, setAutoplayEnabled] = useState(false)
  const paginationProgressStyle: CSSProperties = {
    ['--progress-duration' as string]: `${AUTOPLAY_DELAY_MS}ms`
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
    const sliderNode = sliderShellRef.current
    if (!sliderNode) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.98) {
          setAutoplayEnabled(true)
          observer.disconnect()
        }
      },
      { threshold: [0, 0.5, 0.75, 0.9, 0.98, 1] }
    )

    observer.observe(sliderNode)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!autoplayEnabled || !swiperInstanceRef.current?.autoplay) {
      return
    }
    swiperInstanceRef.current.autoplay.start()
  }, [autoplayEnabled])

  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) {
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (prefersReducedMotion.matches) {
      return
    }

    let revertMatchMedia: (() => void) | undefined
    let isCancelled = false

    const setupAnimation = async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger')
        ])

        if (!sectionRef.current || !sliderShellRef.current || isCancelled) {
          return
        }

        gsap.registerPlugin(ScrollTrigger)
        const mm = gsap.matchMedia()
        revertMatchMedia = () => mm.revert()
        mm.add('(min-width: 1024px)', () => {
          const node = sectionRef.current
          const sliderNode = sliderShellRef.current
          if (!node || !sliderNode) {
            return undefined
          }

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: node,
              start: 'top 80%',
              end: 'bottom 50%',
              scrub: true,
              invalidateOnRefresh: true
            }
          })

          timeline.to(
            node,
            {
              yPercent: -10,
              duration: 1
            },
            0
          )

          timeline.fromTo(
            sliderNode,
            {
              width: '40vw',
              borderRadius: '1rem'
            },
            {
              width: '80vw',
              borderRadius: '0px',
              duration: 0.5,
              immediateRender: false
            },
            0
          )

          timeline.to(
            sliderNode,
            {
              width: '80vw',
              borderRadius: '2px',
              duration: 0.5,
              immediateRender: false
            },
            0.5
          )

          return () => {
            timeline.kill()
            gsap.set(sliderNode, { clearProps: 'width,borderRadius' })
          }
        })
      } catch (error) {
        console.error('Unable to initialize guide ScrollSmoother animation', error)
      }
    }

    setupAnimation()

    return () => {
      isCancelled = true
      revertMatchMedia?.()
    }
  }, [])

  return (
    <section
      id="section-homepageblocsguidelayout"
      ref={sectionRef}
      className="max-w-screen-full bg-white md:pt-[5rem]"
    >
      
      <h2 className="font-custom px-6 text-[12vw] sm:text-[12vw] md:text-4xl leading-tight md:text-[9rem] md:leading-[1] lg:pl-[8rem] lg:-mr-[7rem] pb-[1rem] md:hidden">Activités</h2>

      <div className="flex flex-col items-center px-6 sm:px-10 lg:px-0 h-auto md:h-[50vh] lg:h-[80vh] lg:flex-row">
        <div
          ref={sliderShellRef}
          className="relative w-full overflow-hidden md:lg:rounded-xxl lg:mx-auto"
        >
          <Swiper
            modules={[Navigation, Autoplay, Mousewheel, HashNavigation]}
            className="mySwiper awot-carousel-cursor"
            slidesPerView={1}
            spaceBetween={20}
            loop={true}
            //pagination={{ clickable: true, el: '.custom-pagination' }}
            navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
            autoplay={{ delay: AUTOPLAY_DELAY_MS, disableOnInteraction: false }}
            onSwiper={(swiperInstance) => {
              swiperInstanceRef.current = swiperInstance
              if (!autoplayEnabled && swiperInstance.autoplay?.running) {
                swiperInstance.autoplay.stop()
              }
            }}
            hashNavigation={{
              watchState: false,
              replaceState: true
            }}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: true,
              thresholdDelta: 24,
              thresholdTime: 420,
              sensitivity: 0.6
            }}
            onHashSet={clearUrlHash}
          >
            {posts.map((post) => {
              const paysageNode = post.optionsArticles?.imagePaysage?.node
              const thumbnailNode = post.featuredImage?.node
              const slideImageSrc =
                paysageNode?.sourceUrl ?? paysageNode?.guid ??
                thumbnailNode?.sourceUrl ?? thumbnailNode?.guid ?? null
              const slideImageAlt = paysageNode?.altText ?? thumbnailNode?.altText ?? post.title

              return (
                <SwiperSlide key={post.slug} data-hash={slugify(post.title)} className="carousel-item">
                  <div className="relative">
                    <Link href={`/articles/${post.slug}`} className="block">
                      {slideImageSrc ? (
                        <div className="relative w-full overflow-hidden aspect-[3/2] md:aspect-auto md:h-[450px] lg:h-[80vh]">
                          <Image
                            src={slideImageSrc}
                            alt={slideImageAlt}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 75vw, 100vw"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <div className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center text-white">
                        <AnimatedGuideTitle className="font-schnyder_wide_xl_webdemi text-2xl leading-[0.95] md:text-4xl lg:text-6xl">
                          <span dangerouslySetInnerHTML={{ __html: sanitizePostTitleHtml(post.title) }} />
                        </AnimatedGuideTitle>
                        <AnimatedGuideSubtitle className="mt-2 text-sm leading-tight uppercase font-montserrat md:mt-3">
                          {post.optionsArticles?.champsLibrePageAccueil}
                        </AnimatedGuideSubtitle>
                      </div>
                    </Link>
                  </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
          {/* <div className="swiper-button-prev" />
          <div className="swiper-button-next" />
          <div className="custom-pagination" style={paginationProgressStyle} /> */}
        </div>
        {link?.url ? (
          <div className="my-6 flex w-full items-center justify-center lg:my-0 lg:w-2/12 bg-black text-white h-auto md:h-full hover:bg-white hover:text-black transition-colors duration-300">
            <a
              href={link.url}
              className="transform px-4 py-2 text-sm uppercase font-montserrat lg:-rotate-90"
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
          z-index: 10;
          bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 999px;
          transform: translateX(-50%);
          min-width: 180px;
          transform: translate3d(0, 0, 0);
          transition: 300ms opacity;
          --progress-duration: ${AUTOPLAY_DELAY_MS}ms;
        }
        :global(.custom-pagination .swiper-pagination-bullet) {
          position: relative;
          background: rgba(255, 255, 255, 0.25) !important;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
          width: 12px;
          height: 12px;
          border-radius: 999px;
          overflow: hidden;
          margin: 0 2px;
          opacity: 1 !important;
          transition: background-color 0.3s ease, width 0.3s ease;
        }
        :global(.custom-pagination .swiper-pagination-bullet-active) {
          background: rgba(255, 255, 255, 0.7) !important;
          border-color: rgba(255, 255, 255, 0.9);
          width: 54px;
          height: 12px;
        }
        :global(.custom-pagination .swiper-pagination-bullet::after) {
          content: '';
          position: absolute;
          inset: 0;
          background: #ffffff;
          transform: scaleX(0);
          transform-origin: left center;
        }
        :global(.custom-pagination .swiper-pagination-bullet-active::after) {
          animation: swiperProgressFill var(--progress-duration) linear forwards;
        }
        @keyframes swiperProgressFill {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </section>
  )
}
