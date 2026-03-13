'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import type { gsap as GSAP } from 'gsap'

interface PostSummary {
  id: string
  title: string
  slug?: string
  featuredImage?: {
    node?: {
      sourceUrl?: string | null
      altText?: string | null
    }
  }
  optionsArticles?: {
    champsLibrePageAccueil?: string | null
  }
}

const STATIC_TEXT = 'Découvrez d’autres '
const WORDS = ['restaurants', 'hôtels', 'coffee shops', 'boutiques', 'sorties']
const VIEWPORT_PREFETCH_LIMIT = 4
type GSAPTimeline = ReturnType<GSAP['timeline']>

interface PostFooterClientProps {
  posts: PostSummary[]
  isVoyage?: boolean
}

export default function PostFooterClient({ posts, isVoyage }: PostFooterClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const slideImageRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const transitionElementsRef = useRef<{
    overlay?: HTMLDivElement
    image?: HTMLImageElement
    timeline?: GSAPTimeline
  } | null>(null)
  const isTransitioningRef = useRef(false)
  const transitionCleanupTimeoutRef = useRef<number | null>(null)
  const prefetchedSlugsRef = useRef<Set<string>>(new Set())
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})
  const clearTransitionElements = useCallback(() => {
    if (transitionCleanupTimeoutRef.current) {
      window.clearTimeout(transitionCleanupTimeoutRef.current)
      transitionCleanupTimeoutRef.current = null
    }
    if (transitionElementsRef.current?.timeline) {
      transitionElementsRef.current.timeline.kill()
    }
    transitionElementsRef.current?.overlay?.remove()
    transitionElementsRef.current?.image?.remove()
    transitionElementsRef.current = null
    isTransitioningRef.current = false
    document.documentElement.classList.remove('is-guide-transitioning')
  }, [])

  const prefetchArticle = useCallback(
    async (slug?: string) => {
      if (!slug || prefetchedSlugsRef.current.has(slug) || typeof router.prefetch !== 'function') {
        return
      }

      prefetchedSlugsRef.current.add(slug)

      try {
        const href = `/articles/${slug}`
        const maybePromise = router.prefetch(href)
        await Promise.resolve(maybePromise)
      } catch (error) {
        prefetchedSlugsRef.current.delete(slug)
        console.error('Unable to prefetch article page', error)
      }
    },
    [router]
  )

  const startImageTransition = async (
    imageWrapper: HTMLDivElement,
    imageElement: HTMLImageElement,
    href: string,
    slug?: string
  ) => {
    if (isTransitioningRef.current) {
      return
    }

    void prefetchArticle(slug)
    isTransitioningRef.current = true
    document.documentElement.classList.add('is-guide-transitioning')

    const overlay = document.createElement('div')
    overlay.className = 'guide-voyage-transition-backdrop'
    overlay.setAttribute('aria-hidden', 'true')
    document.body.appendChild(overlay)

    const floatingImage = imageElement.cloneNode(true) as HTMLImageElement
    const wrapperBounds = imageWrapper.getBoundingClientRect()
    const wrapperStyles = window.getComputedStyle(imageWrapper)
    floatingImage.classList.add('guide-voyage-transition-image')
    floatingImage.style.top = `${wrapperBounds.top}px`
    floatingImage.style.left = `${wrapperBounds.left}px`
    floatingImage.style.width = `${wrapperBounds.width}px`
    floatingImage.style.height = `${wrapperBounds.height}px`
    floatingImage.style.borderRadius = wrapperStyles.borderRadius || '0px'
    floatingImage.style.position = 'fixed'
    floatingImage.style.objectFit = 'cover'
    floatingImage.style.pointerEvents = 'none'
    floatingImage.style.zIndex = '9997'
    floatingImage.style.willChange = 'transform, top, left, width, height'
    document.body.appendChild(floatingImage)
    transitionElementsRef.current = { overlay, image: floatingImage }

    try {
      const { default: gsap } = await import('gsap')
      const viewportHeight = window.innerHeight || wrapperBounds.height
      const viewportWidth = window.innerWidth || wrapperBounds.width
      const topTarget = viewportHeight * 0.05
      const leftTarget = viewportWidth * 0.02
      const finalHeight = viewportHeight * 0.9
      const finalWidth = viewportWidth * 0.44

      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          router.push(href)
          transitionCleanupTimeoutRef.current = window.setTimeout(() => {
            clearTransitionElements()
          }, 700)
        },
        onInterrupt: clearTransitionElements
      })

      timeline.to(
        overlay,
        {
          opacity: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRadius: '18px',
          duration: 0.45
        },
        0
      )

      timeline.to(
        floatingImage,
        {
          top: `${topTarget}px`,
          left: `${leftTarget}px`,
          width: `${finalWidth}px`,
          height: `${finalHeight}px`,
          borderRadius: '0',
          duration: 0.6,
          ease: 'power4.inOut'
        },
        0
      )

      if (transitionElementsRef.current) {
        transitionElementsRef.current.timeline = timeline
      }
    } catch (error) {
      console.error('Unable to animate footer transition', error)
      clearTransitionElements()
      router.push(href)
    }
  }

  const handleCardClick = (event: MouseEvent<HTMLAnchorElement>, post: PostSummary) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    if (typeof window === 'undefined' || !post.slug) {
      return
    }

    const imageWrapper = slideImageRefs.current[post.slug] ?? null
    const imageElement = imageWrapper?.querySelector('img') ?? null
    if (!imageWrapper || !(imageElement instanceof HTMLImageElement)) {
      return
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (prefersReducedMotion?.matches) {
      return
    }

    if (isTransitioningRef.current) {
      event.preventDefault()
      return
    }

    event.preventDefault()
    void startImageTransition(imageWrapper, imageElement, `/articles/${post.slug}`, post.slug)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % WORDS.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!posts.length) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }
          const slug = (entry.target as HTMLElement)?.dataset?.postSlug
          if (!slug) {
            return
          }
          void prefetchArticle(slug)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.25 }
    )

    posts.slice(0, VIEWPORT_PREFETCH_LIMIT).forEach((post) => {
      if (!post.slug) {
        return
      }
      const node = cardRefs.current[post.slug]
      if (node) {
        observer.observe(node)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [posts, prefetchArticle])

  useEffect(() => {
    return () => {
      clearTransitionElements()
    }
  }, [clearTransitionElements])

  const visiblePosts = useMemo(() => posts.slice(0, 5), [posts])

  if (visiblePosts.length === 0) {
    return null
  }

  return (
    <div className="removeSticky elementor-element-27be2e8c elementor-widget elementor-widget-posts">
      <h2 className="cd-headline wordrotate mt-10 flex flex-row px-[2rem] font-custom text-4xl">
        {isVoyage ? (
          <div className="flex-none font-schnyder_xl_webdemi">Découvrez d&apos;autres destinations</div>
        ) : (
          <>
            <div className="flex-none pr-[10px]">{STATIC_TEXT}</div>
            <div className="cd-words-wrapper flex-grow font-schnyder_xl_webdemi">
              {WORDS.map((word, index) => (
                <span key={word} className={index === currentIndex ? 'is-visible' : 'is-hidden'}>
                  {word}
                </span>
              ))}
            </div>
          </>
        )}
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
              data-post-slug={post.slug ?? undefined}
              ref={(node) => {
                if (!post.slug) {
                  return
                }
                if (node) {
                  cardRefs.current[post.slug] = node
                } else {
                  delete cardRefs.current[post.slug]
                }
              }}
            >
              <a
                className="elementor-post__thumbnail__link rounded-md"
                href={`/articles/${post.slug}/`}
                onClick={(event) => handleCardClick(event, post)}
                onPointerEnter={() => {
                  void prefetchArticle(post.slug)
                }}
                onFocus={() => {
                  void prefetchArticle(post.slug)
                }}
              >
                <div
                  ref={(node) => {
                    if (!post.slug) {
                      return
                    }
                    if (node) {
                      slideImageRefs.current[post.slug] = node
                    } else {
                      delete slideImageRefs.current[post.slug]
                    }
                  }}
                  className="elementor-post__thumbnail footer-elementor-post__thumbnail relative aspect-[3/4] overflow-hidden"
                >
                  {post.featuredImage?.node?.sourceUrl ? (
                    <Image
                      className="object-cover transition-transform duration-300 hover:scale-110"
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.featuredImage.node.altText ?? post.title}
                      fill
                      // style={{ top: 'calc(50% + 1px)', left: 'calc(50% + 1px)' }}
                      sizes="(min-width: 1280px) 15vw, 50vw"
                      unoptimized
                    />
                  ) : null}
                </div>
              </a>
              <div className="elementor-post__text font-montserrat mt-3">
                {post.optionsArticles?.champsLibrePageAccueil ? (
                  <p
                    className="mb-0 text-[0.5vw] uppercase font-montserrat italic text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: post.optionsArticles.champsLibrePageAccueil
                    }}
                  />
                ) : null}
                <h2
                  className="text-[3vw] md:text-xs uppercase font-brandonRegular font-medium tracking-[2px]"
                  dangerouslySetInnerHTML={{ __html: post.title }}
                />
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
      <style jsx global>{`
        .guide-voyage-transition-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0);
          backdrop-filter: blur(0);
          -webkit-backdrop-filter: blur(0);
          opacity: 0;
          pointer-events: none;
          z-index: 9996;
          will-change: opacity, backdrop-filter;
        }
        .guide-voyage-transition-image {
          position: fixed;
          pointer-events: none;
          object-fit: cover;
          z-index: 9997;
        }
      `}</style>
    </div>
  )
}
