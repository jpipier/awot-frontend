'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import Search from '@/components/search/Search'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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

export default function SliderLayoutClient({ slides, siteTitle, siteDescription }: SliderLayoutClientProps) {
  const loop = slides.length > 1

  return (
    <div className="relative h-[85vh] w-full">
      <div className="absolute left-1/2 top-1/4 z-20 w-full max-w-full -translate-x-1/2">
        <div className="mb-[10vh] mt-[-5vh] text-center text-white">
          <h1 className="font-custom text-[45pt] lg:text-[103pt]">{siteTitle}</h1>
          <p className="font-montserrat text-[8pt] uppercase lg:text-[8pt] -mt-[1rem] tracking-wider">{siteDescription}</p>
        </div>
        <Search />
      </div>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        spaceBetween={10}
        loop={loop}
        navigation={false}
        pagination={false}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        className="h-[85vh]"
      >
        {slides.map((slide, index) => {
          const imageSrc = slide.img?.node?.guid
          if (!imageSrc) {
            return null
          }
          const content = (
            <div className="relative h-screen">
              <Image
                src={imageSrc}
                alt={slide.titre ?? `Slide ${index + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                unoptimized
                priority={index === 0}
              />
              {slide.afficherDuTexte ? (
                <div className="absolute inset-0 -top-[15vw] flex flex-col items-center justify-center text-center text-white">
                  <p className="font-brandongrotesque-light mb-6 text-xs uppercase after:mt-2 after:block after:-ml-[30%] after:h-[1px] after:w-[160%] after:bg-white">
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
