'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

interface PostSummary {
  id: string
  title: string
  slug: string
  featuredImage?: {
    node?: {
      sourceUrl?: string
      altText?: string
    }
  }
}

const STATIC_TEXT = 'Découvrez d’autres '
const WORDS = ['restaurants', 'hôtels', 'coffee shops', 'boutiques', 'sorties']

interface PostFooterClientProps {
  posts: PostSummary[]
}

export default function PostFooterClient({ posts }: PostFooterClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % WORDS.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  const visiblePosts = useMemo(() => posts.slice(0, 5), [posts])

  if (visiblePosts.length === 0) {
    return null
  }

  return (
    <div className="removeSticky elementor-element-27be2e8c elementor-widget elementor-widget-posts">
      <h2 className="cd-headline wordrotate mt-10 flex flex-row px-[2rem] font-custom text-4xl">
        <div className="flex-none pr-[10px]">{STATIC_TEXT}</div>
        <div className="cd-words-wrapper flex-grow font-schnyder_xl_webdemi">
          {WORDS.map((word, index) => (
            <span key={word} className={index === currentIndex ? 'is-visible' : 'is-hidden'}>
              {word}
            </span>
          ))}
        </div>
      </h2>
      <div className="elementor-widget-container">
        <div className="elementor-posts-container elementor-posts elementor-posts--skin-classic elementor-has-item-ratio grid grid-cols-2 gap-8 px-[2rem] sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {visiblePosts.map((post, index) => (
            <article
              key={post.id}
              className={clsx('elementor-grid-item', {
                'hidden sm:block': index >= 2 && index < 4,
                'hidden lg:block': index === 4
              })}
            >
              <a className="elementor-post__thumbnail__link" href={`/articles/${post.slug}/`}>
                <div className="elementor-post__thumbnail footer-elementor-post__thumbnail relative aspect-[3/4] overflow-hidden">
                  {post.featuredImage?.node?.sourceUrl ? (
                    <Image
                      className="rounded-md object-cover transition-transform duration-300 hover:scale-110"
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.featuredImage.node.altText ?? post.title}
                      fill
                      style={{ top: 'calc(50% + 1px)', left: 'calc(50% + 1px)' }}
                      sizes="(min-width: 1280px) 15vw, 50vw"
                      unoptimized
                    />
                  ) : null}
                </div>
              </a>
              <div className="elementor-post__text font-montserrat">
                <a href={`/articles/${post.slug}/`} dangerouslySetInnerHTML={{ __html: post.title }} />
              </div>
            </article>
          ))}
        </div>
      </div>
      <style jsx>{`
        .cd-words-wrapper {
          position: relative;
        }
        .cd-headline.wordrotate span {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
          transform: rotateX(180deg);
          transform-origin: 50% 100%;
          transition: all 300ms ease;
        }
        .cd-headline.wordrotate span.is-visible {
          position: absolute;
          opacity: 1;
          transform: rotateX(0deg);
        }
        .elementor-posts-container.elementor-has-item-ratio .elementor-post__thumbnail img{insert
          top: calc(50% + 1px) !important;
          left: calc(50% + 1px) !important;
        }
      `}</style>
    </div>
  )
}
