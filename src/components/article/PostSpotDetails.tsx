'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { sanitizeExcerptText } from '@/lib/sanitize-excerpt-text'
import { sanitizePostTitleHtml } from '@/lib/sanitize-post-title-html'
import type { Article } from '@/types/wordpress'

interface PostSpotDetailsProps {
  article: Article
}

interface ContactRow {
  key: string
  label: string
  href?: string
  icon: 'address' | 'phone' | 'instagram' | 'website'
}

interface SpotLayout {
  width: number
  left: number
}

function pickFirstString(values: Array<unknown>) {
  for (const value of values) {
    if (typeof value !== 'string') {
      continue
    }

    const normalized = sanitizeExcerptText(value).trim()
    if (normalized) {
      return normalized
    }
  }

  return ''
}

function toTelHref(phone: string) {
  const normalized = phone.replace(/[^+\d]/g, '')
  if (!normalized) {
    return undefined
  }

  return `tel:${normalized}`
}

function toInstagramHref(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value
  }

  const username = value.replace(/^@/, '').trim()
  if (!username) {
    return undefined
  }

  return `https://www.instagram.com/${username}/`
}

function toWebsiteHref(value: string) {
  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return `https://${value}`
}

function SpotIcon({ icon }: { icon: ContactRow['icon'] }) {
  if (icon === 'address') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-black">
        <path
          d="M12 2.75a6.75 6.75 0 0 0-6.75 6.76c0 4.58 5.2 10.2 6.18 11.2a.8.8 0 0 0 1.14 0c.98-1 6.18-6.62 6.18-11.2A6.75 6.75 0 0 0 12 2.75Zm0 8.95a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (icon === 'phone') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-black">
        <path
          d="M17.71 14.29c-.39-.39-1.02-.39-1.41 0l-1.58 1.59a14.83 14.83 0 0 1-6.6-6.6l1.58-1.58c.39-.39.39-1.02 0-1.41L7.12 3.71a1 1 0 0 0-1.41 0L3.9 5.53a2 2 0 0 0-.52 1.94c.92 3.57 2.75 6.87 5.31 9.43 2.56 2.56 5.86 4.39 9.43 5.31a2 2 0 0 0 1.94-.52l1.82-1.82a1 1 0 0 0 0-1.41Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  if (icon === 'website') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-black">
        <path
          d="M5 4.5h14A2.5 2.5 0 0 1 21.5 7v8A2.5 2.5 0 0 1 19 17.5h-5.25v1.25h2.5v1.75h-8.5v-1.75h2.5V17.5H5A2.5 2.5 0 0 1 2.5 15V7A2.5 2.5 0 0 1 5 4.5Zm0 1.75A.75.75 0 0 0 4.25 7v7.25h15.5V7a.75.75 0 0 0-.75-.75H5Zm6 11.25h2V17.5h-2v.75Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-black">
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm4.75-3a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function PostSpotDetails({ article }: PostSpotDetailsProps) {
  const [layout, setLayout] = useState<SpotLayout | null>(null)

  useEffect(() => {
    const applyLayoutFromPreviousElement = () => {
      if (window.innerWidth < 1024) {
        setLayout(null)
        return
      }

      const root = document.querySelector('section.elementor-element-40717a53 .contentElementor')
      if (!root) {
        setLayout(null)
        return
      }

      const candidates = Array.from(
        root.querySelectorAll<HTMLElement>('.elementor-container, .e-con-inner, .elementor-column, .elementor-widget-wrap')
      )

      for (let index = candidates.length - 1; index >= 0; index -= 1) {
        const node = candidates[index]
        const rect = node.getBoundingClientRect()
        if (rect.width < 240 || rect.height < 40) {
          continue
        }

        if (rect.width >= window.innerWidth * 0.92) {
          setLayout(null)
          return
        }

        setLayout({
          width: Math.round(rect.width),
          left: Math.round(rect.left)
        })
        return
      }

      setLayout(null)
    }

    applyLayoutFromPreviousElement()
    window.addEventListener('resize', applyLayoutFromPreviousElement)
    return () => window.removeEventListener('resize', applyLayoutFromPreviousElement)
  }, [])

  const titleHtml = sanitizePostTitleHtml(article.title)
  const coordonnees = ((article.coordonnees ?? null) as Record<string, unknown> | null) ?? null
  const options = (article.optionsArticles ?? {}) as Record<string, unknown>

  const address = pickFirstString([coordonnees?.adresse, options.adresse, options.address])
  const phone = pickFirstString([
    coordonnees?.telephone,
    options.telephone,
    options.numeroDeTelephone,
    options.numeroTelephone,
    options.phone
  ])
  const instagram = pickFirstString([
    coordonnees?.instagram,
    options.instagram,
    options.instagramUrl,
    options.instagramUsername
  ])
  const website = pickFirstString([
    coordonnees?.siteInternet,
    options.siteInternet,
    options.siteWeb,
    options.site,
    options.website
  ])

  const contacts: ContactRow[] = [
    ...(address ? [{ key: 'address', label: address, icon: 'address' as const }] : []),
    ...(phone ? [{ key: 'phone', label: phone, href: toTelHref(phone), icon: 'phone' as const }] : []),
    ...(instagram
      ? [{ key: 'instagram', label: instagram, href: toInstagramHref(instagram), icon: 'instagram' as const }]
      : []),
    ...(website ? [{ key: 'website', label: website, href: toWebsiteHref(website), icon: 'website' as const }] : [])
  ]

  const filtres = (article.filtres?.nodes ?? [])
    .map((filtre) => {
      const label = sanitizeExcerptText(filtre.name ?? '').trim()
      if (!label) {
        return null
      }

      const pictoNode = filtre.filtreChamps?.pictoHover?.node ?? filtre.filtreChamps?.picto_hover?.node
      const pictoUrl = pickFirstString([pictoNode?.sourceUrl, pictoNode?.mediaItemUrl])
      const pictoAlt = sanitizeExcerptText(pictoNode?.altText ?? label)

      return {
        key: filtre.id ?? filtre.slug,
        label,
        pictoUrl,
        pictoAlt
      }
    })
    .filter((item): item is { key: string; label: string; pictoUrl: string; pictoAlt: string } =>
      Boolean(item && item.pictoUrl)
    )

  if (!contacts.length && !filtres.length) {
    return null
  }

  return (
    <section>
      <div
        className={layout ? 'py-12 md:py-16' : 'w-full px-6 py-12 md:py-16'}
        style={
          layout
            ? {
                width: `calc(${layout.width}px * 2.2)`,
                marginLeft: `calc( ${layout.left}px / 1.45)`
              }
            : undefined
        }
      >
        <div className="mb-10 flex items-center gap-5 md:mb-14 md:gap-8">
          <span className="h-px flex-1 bg-black/60" />
          <h2
            className="shrink-0 text-center font-schnyder_wide_xl_webdemi text-[24px] leading-none md:text-[24px]"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />
          <span className="h-px flex-1 bg-black/60" />
        </div>

        {contacts.length > 0 ? (
          <ul className="mb-12 space-y-1 md:mb-16 md:space-y-1">
            {contacts.map((row) => (
              <li key={row.key} className="flex items-center gap-3 md:gap-4">
                <span className="mt-0.5 shrink-0">
                  <SpotIcon icon={row.icon} />
                </span>
                {row.href ? (
                  <a
                    href={row.href}
                    target={row.key === 'website' || row.key === 'instagram' ? '_blank' : undefined}
                    rel={row.key === 'website' || row.key === 'instagram' ? 'noreferrer noopener' : undefined}
                    className="brandon_grotesquelight font-[300] text-[16px] text-black md:text-[16px]"
                  >
                    {row.label}
                  </a>
                ) : (
                  <span className="m-0 brandon_grotesquelight font-[300] text-[16px] text-black md:text-[16px]">
                    {row.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : null}

        {filtres.length > 0 ? (
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-5 md:gap-x-14">
            {filtres.map((filtre) => (
              <li key={filtre.key} className="flex items-center gap-3">
                <Image
                  src={filtre.pictoUrl}
                  alt={filtre.pictoAlt}
                  width={20}
                  height={20}
                  unoptimized
                  className="object-contain"
                />
                <span className="font-brandon_grotesquelight text-[14px] leading-none md:text-[14px]">{filtre.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}
