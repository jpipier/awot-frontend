import Image from 'next/image'
import Link from 'next/link'
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
  const src = image?.node?.guid ?? image?.node?.sourceUrl ?? ''
  const alt = image?.node?.altText ?? ''
  const naturalWidth = image?.node?.mediaDetails?.width ?? 1200
  const naturalHeight = image?.node?.mediaDetails?.height ?? 800
  const hasCopy = Boolean(titre || contenu || (bouton?.title && bouton?.url))

  if (!src && !hasCopy) {
    return null
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl place-items-center gap-10 px-6 sm:px-10 lg:px-0 lg:mx-[8rem] py-10 md:min-h-[80vh] md:grid-cols-[650px_minmax(0,1fr)]">
      {src ? (
        <div className="flex w-full items-center justify-center">
          <Image
            src={src}
            alt={alt}
            width="552"
            height="440"
            className="h-[440px] w-full max-w-[550px]"
          />
        </div>
      ) : null}
      <div className="flex w-full flex-col gap-6 md:items-start">
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
            className="inline-flex w-max items-center justify-center rounded-full border border-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition hover:bg-black hover:text-white"
          >
            {bouton.title}
          </Link>
        ) : null}
      </div>
    </div>
  )
}
