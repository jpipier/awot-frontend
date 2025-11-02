'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import he from 'he'
import type { Article } from '@/types/wordpress'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface GuideVoyageLayoutClientProps {
  posts: Article[]
}

export default function GuideVoyageLayoutClient({ posts }: GuideVoyageLayoutClientProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const sanitizedPosts = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        excerptPlain: he
          .decode(post.excerpt ?? '')
          .replace(/<[^>]*>/g, '')
          .trim()
      })),
    [posts]
  )

  const current = sanitizedPosts[activeIndex] ?? sanitizedPosts[0]

  return (
    <div className="mt-10 flex flex-col items-start gap-10 lg:flex-row">
      <div className="flex w-full flex-col gap-4 pr-6 text-left lg:w-2/5 lg:pr-16 px-[8rem] self-end pb-[4rem]">
        <h2 className="text-2xl font-montserrat font-medium uppercase leading-tight">{current?.title}</h2>
        {current?.optionsArticles?.champsLibrePageAccueil ? (
          <h3 className="text-lg text-gray-600 italic font-montserrat italic">
            {current.optionsArticles.champsLibrePageAccueil}
          </h3>
        ) : null}
        <p className="text-sm font-light font-montserrat">{current?.excerptPlain}</p>
        {current?.slug ? (
          <Link
            href={`/articles/${current.slug}`}
            className="mt-4 inline-block bg-black px-4 py-2 text-sm uppercase text-white w-fit"
          >
            Lire la suite
          </Link>
        ) : null}
      </div>
      <div className="w-full overflow-hidden lg:w-3/5 lg:pl-0">
        <Swiper
          modules={[Navigation, Pagination]}
          className="mySwiper"
          slidesPerView={1.2}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 2.5, spaceBetween: 20 }
          }}
          onSlideChange={({ activeIndex: index }) => setActiveIndex(index)}
        >
          {sanitizedPosts.map((post) => (
            <SwiperSlide key={post.slug} className="carousel-item">
              <div className="group relative">
                <Link href={`/articles/${post.slug}`}
                  className="block">
                  {post.optionsArticles?.imagePortait?.node?.guid ? (
                    <div className="relative w-full overflow-hidden h-[320px] md:h-[420px] lg:h-[480px] 3xl:h-[540px]">
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
                    <p className="mb-1 text-[12px] uppercase font-montserrat italic" dangerouslySetInnerHTML={{ __html: post.optionsArticles?.champsLibrePageAccueil ?? '' }} />
                    <h3 className="mt-2 text-left text-[15px] uppercase font-montserrat font-medium">{post.title}</h3>
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
