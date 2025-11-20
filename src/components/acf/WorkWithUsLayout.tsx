'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'
import type { WPImage } from '@/types/wordpress'

interface WorkWithUsLayoutProps {
  image?: {
    node?: WPImage
  }
  titre?: string | null
  contenu?: string | null
  bouton?: {
    target?: string | null
    title?: string | null
    url?: string | null
  }
}

export default function WorkWithUsLayout({ image, titre, contenu, bouton }: WorkWithUsLayoutProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const imageWrapperRef = useRef<HTMLDivElement | null>(null)
  const [parallax, setParallax] = useState(0)
  const src = image?.node?.guid ?? image?.node?.sourceUrl ?? ''
  const alt = image?.node?.altText ?? ''
  const naturalWidth = image?.node?.mediaDetails?.width ?? 1200
  const naturalHeight = image?.node?.mediaDetails?.height ?? 800
  const hasCopy = Boolean(titre || contenu || (bouton?.title && bouton?.url))

  useEffect(() => {
    const node = containerRef.current
    if (!node) {
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio >= 0.6)
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const wrapper = imageWrapperRef.current
    if (!wrapper) {
      return
    }

    let frame: number | null = null

    const updateParallax = () => {
      frame = null
      const rect = wrapper.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1
      const center = rect.top + rect.height / 2
      const viewportCenter = viewportHeight / 2
      const distanceFromCenter = center - viewportCenter
      const normalized = Math.max(Math.min(distanceFromCenter / viewportHeight, 1), -1)
      setParallax(normalized * -80)
    }

    updateParallax()

    const handleScroll = () => {
      if (frame !== null) {
        return
      }
      frame = window.requestAnimationFrame(updateParallax)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])
  if (!src && !hasCopy) {
    return null
  }

  const mediaClassName = clsx(
    'relative z-10 flex w-full items-center justify-center transition-all duration-[900ms] ease-out will-change-transform will-change-opacity md:w-1/2',
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
  )
  const contentClassName = clsx(
    'relative z-10 flex w-full flex-col gap-6 md:items-start transition-all duration-700 ease-out will-change-transform will-change-opacity md:w-1/2',
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
  )

  const circleClassName = clsx(
    'pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#f7f4ef]',
    'shadow-[0_0_120px_rgba(0,0,0,0.08)] transition-transform duration-[1400ms] ease-[cubic-bezier(0.19,1,0.22,1)]',
    isVisible ? 'scale-[10] translate-x-10 translate-y-16 opacity-100' : 'scale-0 translate-x-0 -translate-y-4 opacity-0'
  )

  return (
    <div
      ref={containerRef}
      className="relative mx-auto grid w-full max-w-6xl place-items-center gap-10 overflow-hidden px-6 sm:px-10 lg:px-0 lg:mx-[8rem] py-10 md:min-h-[80vh] lg:grid-cols-[650px_minmax(0,1fr)]"
    >
      <div
        aria-hidden="true"
        className={circleClassName}
        style={{ transformOrigin: 'top right' }}
      />
      {src ? (
        <div
          ref={imageWrapperRef}
          className={mediaClassName}
          style={{ transitionDelay: isVisible ? '0ms' : '0ms', transform: `translateY(${parallax}px)` }}
        >
          <Image
            src={src}
            alt={alt}
            width="552"
            height="440"
            className="h-[440px] w-full max-w-[550px] object-cover"
          />
        </div>
      ) : null}
      <div className={contentClassName} style={{ transitionDelay: isVisible ? '120ms' : '0ms' }}>
        {titre ? (
          <h2 className="font-custom text-4xl leading-tight lg:-ml-[10rem] md:text-6xl md:text-[4.5vw] md:leading-[1.05] md:relative md:z-10">
            {titre}
          </h2>
        ) : null}
        {contenu ? (
          <div className="contentElementor" dangerouslySetInnerHTML={{ __html: contenu }} />
        ) : null}
        {bouton?.url && bouton?.title ? (
          <Link
            href={bouton.url}
            target={bouton.target ?? undefined}
            rel={bouton.target === '_blank' ? 'noopener noreferrer' : undefined}
            className="portraits-split text-xs uppercase tracking-[0.2em] text-current hover:underline "
          >
            {bouton.title}
            <span aria-hidden="true" >
              <div aria-hidden="true" style={{ position: 'relative', display: 'inline-block' }}>→</div>
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  )
}
