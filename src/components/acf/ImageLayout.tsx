import Image from 'next/image'
import type { WPImage } from '@/types/wordpress'

interface ImageLayoutProps {
  image?: {
    node?: WPImage
  }
}

export default function ImageLayout({ image }: ImageLayoutProps) {
  const src = image?.node?.sourceUrl ?? image?.node?.guid

  if (!src) {
    return null
  }

  return (
    <section className="relative h-screen w-full">
      <Image src={src} alt="" fill className="object-cover" sizes="100vw" unoptimized priority />
    </section>
  )
}
