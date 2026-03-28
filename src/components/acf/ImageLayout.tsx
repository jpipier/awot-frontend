import Image from 'next/image'
import type { WPImage } from '@/types/wordpress'

interface ImageLayoutProps {
  image?: {
    node?: WPImage
  }
}

export default function ImageLayout({ image }: ImageLayoutProps) {
  const src = image?.node?.sourceUrl ?? image?.node?.guid
  const alt = image?.node?.altText ?? ''

  if (!src) {
    return null
  }

  return (
    <section className="relative h-[80vh] w-full">
      <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" priority />
    </section>
  )
}
