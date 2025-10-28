'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import type { Article } from '@/types/wordpress'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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
  return (
    <div className="mx-auto max-w-screen-full overflow-hidden">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-end">
        <div
          className={`flex w-full flex-col gap-6 px-4 text-left ${
            postParPage > 2 ? 'lg:w-2/5 lg:px-[6rem]' : 'lg:w-3/5 lg:px-[8rem]'
          }`}
        >
          {headline ? <h3 className="text-sm font-light uppercase tracking-wide text-gray-600">{headline}</h3> : null}
          {titreDeLaSection ? (
            <h2 className="font-schnyder_wide_xl_webdemi text-4xl leading-tight lg:text-6xl text-left">
              {titreDeLaSection}
            </h2>
          ) : null}
          {contenu ? (
            <div className="text-sm leading-relaxed lato-light" dangerouslySetInnerHTML={{ __html: contenu }} />
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
                      <div className="relative h-[275px] w-full overflow-hidden md:h-[500px] lg:h-[490px] 3xl:h-[590px]">
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
                        className="mb-1 text-xs uppercase font-brandon_grotesquelight_italic"
                        dangerouslySetInnerHTML={{
                          __html: post.optionsArticles?.champsLibrePageAccueil ?? ''
                        }}
                      />
                      <h3 className="text-base uppercase font-brandon_grotesquemedium">{post.title}</h3>
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
