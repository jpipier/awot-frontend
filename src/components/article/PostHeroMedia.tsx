'use client'

import { useEffect, useRef, useState } from 'react'

interface PostHeroMediaProps {
  videoSrc?: string | null
  imageSrc?: string | null
  imageSrcSet?: string
  imageAlt: string
}

export default function PostHeroMedia({
  videoSrc,
  imageSrc,
  imageSrcSet,
  imageAlt
}: PostHeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoSrc) {
      return
    }

    video.defaultMuted = true
    video.muted = true

    const playVideo = async () => {
      try {
        await video.play()
      } catch {
        // Ignore autoplay rejections and keep the element mounted.
      }
    }

    void playVideo()
  }, [videoSrc])

  if (videoSrc) {
    return (
      <div className="relative flex w-full h-full items-center justify-center overflow-hidden bg-transparent">
        <video
          ref={videoRef}
          src={videoSrc}
          controls={showControls}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          poster={imageSrc ?? undefined}
          className="awot-post-hero-video"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          onFocus={() => setShowControls(true)}
          onBlur={() => setShowControls(false)}
        />
      </div>
    )
  }

  if (imageSrc) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {/* Use native img + WP srcSet to bypass next/image remote optimization cold-start on hero. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          srcSet={imageSrcSet}
          sizes="(min-width: 768px) 50vw, 100vw"
          alt={imageAlt}
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    )
  }

  return <div className="w-full h-full bg-gray-200" />
}
