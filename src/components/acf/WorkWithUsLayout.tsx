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
        if (entry.intersectionRatio >= 0.6) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: [0.2, 0.4, 0.6, 0.8, 1] }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (!src && !hasCopy) {
    return null
  }

  const mediaClassName = clsx(
    'flex w-full items-center justify-center transition-all duration-[900ms] ease-out will-change-transform will-change-opacity',
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
  )
  const contentClassName = clsx(
    'flex w-full flex-col gap-6 md:items-start transition-all duration-700 ease-out will-change-transform will-change-opacity',
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
  )

  return (
    <div
      ref={containerRef}
      className="mx-auto grid w-full max-w-6xl place-items-center gap-10 px-6 sm:px-10 lg:px-0 lg:mx-[8rem] py-10 md:min-h-[80vh] md:grid-cols-[650px_minmax(0,1fr)]"
    >
      {src ? (
        <div className={mediaClassName} style={{ transitionDelay: isVisible ? '0ms' : '0ms' }}>
          <Image
            src={src}
            alt={alt}
            width="552"
            height="440"
            className="h-[440px] w-full max-w-[550px] rounded-xl shadow-lg object-cover"
          />
        </div>
      ) : null}
      <div className={contentClassName} style={{ transitionDelay: isVisible ? '120ms' : '0ms' }}>
        {titre ? (
          <h2 className="font-custom text-4xl leading-tight md:-ml-[10rem] md:text-6xl md:text-[4.5rem] md:leading-[1.05] md:relative md:z-10">
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
