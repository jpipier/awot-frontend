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
    <div className="mt-10 flex flex-col items-start lg:flex-row">
      <div className="w-full px-[2rem] text-left lg:w-2/6 lg:px-[10rem]">
        <h2 className="text-[20px] uppercase font-brandon_grotesquemedium">{current?.title}</h2>
        <h3 className="text-[20px] text-gray-600 lato-light-italic">
          {current?.optionsArticles?.champsLibrePageAccueil}
        </h3>
        <p className="mt-4 text-sm lato-light">{current?.excerptPlain}</p>
        {current?.slug ? (
          <Link href={`/articles/${current.slug}`} className="mt-10 inline-block bg-black px-4 py-2 text-sm uppercase text-white">
            Lire la suite
          </Link>
        ) : null}
      </div>
      <div className="w-full overflow-hidden pl-[1rem] lg:w-4/6">
        <Swiper
          modules={[Navigation, Pagination]}
          className="mySwiper"
          slidesPerView={1.2}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 1.7, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 2.5, spaceBetween: 40 }
          }}
          onSlideChange={({ activeIndex: index }) => setActiveIndex(index)}
        >
          {sanitizedPosts.map((post) => (
            <SwiperSlide key={post.slug} className="carousel-item">
              <div className="group relative">
                <Link href={`/articles/${post.slug}`}
                  className="block">
                  {post.optionsArticles?.imagePortait?.node?.guid ? (
                    <div className="relative h-[300px] w-full overflow-hidden md:h-[500px] lg:h-[490px] 3xl:h-[590px]">
                      <Image
                        src={post.optionsArticles.imagePortait.node.guid}
                        alt={post.title}
                        fill
                        className="rounded-md object-cover shadow-lg transition-transform duration-300 group-hover:scale-110"
                        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      unoptimized
                      />
                    </div>
                  ) : null}
                  <div className="mt-3">
                    <p className="mb-1 text-[12px] uppercase font-brandon_grotesquelight_italic" dangerouslySetInnerHTML={{ __html: post.optionsArticles?.champsLibrePageAccueil ?? '' }} />
                    <h3 className="mt-2 text-left text-[15px] uppercase font-brandon_grotesquemedium">{post.title}</h3>
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
