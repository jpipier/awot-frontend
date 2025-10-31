'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

export default function PortraitLayoutClient({ posts, titreDeLaSection, contenu }: PortraitLayoutClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsVisible(entry.isIntersecting)
      })
    }, { threshold: 0.5 })

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const slides = useMemo(() => posts, [posts])

  return (
    <div
      ref={containerRef}
      className={clsx(
        'bloc-portrait relative overflow-hidden pt-0 pb-20 sm:flex sm:flex-row lg:block',
        'mb-40 transition-colors duration-500 lg:mb-0',
        isVisible ? 'bg-black' : 'bg-white'
      )}
    >
      <div
        className={clsx(
          'sm:relative lg:absolute top-[6vw] sm:right-0 right-[0.5vw] lg:right-[10.5vw] flex w-50 flex-col sm:w-full lg:w-1/2 lg:pl-[11rem] lg:pr-24',
          isVisible ? 'text-white' : 'text-black'
        )}
      >
        <h2 className="px-12 text-[4rem] font-schnyder_wide_xl_webdemi md:px-0 lg:pr-0 lg:text-[5rem]">
          {titreDeLaSection}
        </h2>
        <div
          className="mt-4 px-12 text-sm lato-light md:px-12 lg:pl-0 lg:pr-0"
          dangerouslySetInnerHTML={{ __html: contenu }}
        />
      </div>
      <Swiper
        modules={[Navigation]}
        slidesPerView={2.9}
        spaceBetween={0}
        loop={false}
        navigation={{ prevEl: '.swiper-button-prev-portrait', nextEl: '.swiper-button-next-portrait' }}
        breakpoints={{
          0: { slidesPerView: 1.15 },
          640: { slidesPerView: 1.5 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 2.9 }
        }}
        onSlideChange={({ activeIndex }) => setCurrentIndex(activeIndex % slides.length)}
        className="portrait-slider mx-4"
      >
        {slides.map((post, index) => {
          const imageNode =
            post.optionsArticles?.imagePaysage?.node ??
            post.optionsArticles?.imagePortait?.node ??
            post.featuredImage?.node
          const imageSrc = imageNode?.sourceUrl ?? imageNode?.guid ?? null

          return (
            <SwiperSlide key={post.slug ?? index} className="relative p-4">
              <Link href={`/articles/${post.slug ?? ''}`} className="block">
                {imageSrc ? (
                  <div className="relative w-full overflow-hidden lg:h-[21rem]">
                    <Image
                      src={imageSrc}
                      alt={imageNode?.altText ?? post.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      unoptimized
                    />
                  </div>
                ) : null}
              </Link>
              <div
                className={clsx(
                  'mt-3 transition-colors',
                  currentIndex === index ? 'text-xl' : 'text-lg',
                  isVisible ? 'text-white' : 'text-black'
                )}
              >
                <Link href={`/articles/${post.slug ?? ''}`}>
                  <p className="font-brandon_grotesquelight_italic mb-1 text-xs uppercase">
                    {post.categories?.edges?.[0]?.node.name ?? ''}
                  </p>
                  <h3 className="text-base uppercase font-brandon_grotesquemedium">{post.title}</h3>
                </Link>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
      <div className="swiper-button-prev-portrait" />
      <div className="swiper-button-next-portrait" />
      <style jsx>{`
        @media (min-width: 640px) {
          .portrait-slider .swiper-wrapper {
            align-items: flex-start;
          }
        }
        @media (min-width: 768px) {
          .portrait-slider .swiper-wrapper {
            align-items: flex-end;
          }
        }
        @media (min-width: 1024px) {
          .portrait-slider .swiper-slide {
            padding-top: 150px;
            height: 500px;
            transition: height 0.5s ease, padding 0.5s ease;
            display: block !important;
          }
          .portrait-slider .swiper-slide-active {
            padding-top: 0;
            height: 650px;
            padding-left: 3rem;
            width: 50vw !important;
          }
          .bloc-portrait .swiper-slide-next {
            margin-right: 0 !important;
          }
          .swiper-button-next-portrait,
          .swiper-button-prev-portrait {
            display: flex;
          }
        }
        .swiper-button-next-portrait,
        .swiper-button-prev-portrait {
          display: none;
        }
        .portrait-slider .swiper-slide {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }
        .portrait-slider .swiper-wrapper {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-content: flex-end;
        }
      `}</style>
    </div>
  )
}
