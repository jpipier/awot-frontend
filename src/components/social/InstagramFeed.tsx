import Image from 'next/image'
import { getInstagramPosts } from '@/lib/instagram'
import type { InstagramPost } from '@/types/instagram'

const CAPTION_PREVIEW_LENGTH = 110

interface InstagramFeedProps {
  title?: string
  description?: string
  limit?: number
  ctaLabel?: string
  usernameOverride?: string
}

function truncateCaption(caption?: string | null) {
  if (!caption) {
    return null
  }

  const trimmed = caption.trim()

  if (trimmed.length <= CAPTION_PREVIEW_LENGTH) {
    return trimmed
  }

  return `${trimmed.slice(0, CAPTION_PREVIEW_LENGTH).trimEnd()}…`
}

type FeedMediaAsset = {
  url: string
  kind: 'image' | 'video'
  posterUrl?: string
}

function getPostMediaAsset(post: InstagramPost): FeedMediaAsset | null {
  const isVideoUrl = (url?: string | null) => {
    if (!url) {
      return false
    }

    return /\.(mp4|mov|webm|m4v)(?:$|\?)/i.test(url)
  }

  const pickImage = ({
    mediaUrl,
    thumbnailUrl
  }: {
    mediaUrl?: string | null
    thumbnailUrl?: string | null
  }): FeedMediaAsset | null => {
    if (thumbnailUrl && !isVideoUrl(thumbnailUrl)) {
      return { url: thumbnailUrl, kind: 'image' }
    }

    if (mediaUrl && !isVideoUrl(mediaUrl)) {
      return { url: mediaUrl, kind: 'image' }
    }

    return null
  }

  const pickVideo = ({
    mediaUrl,
    thumbnailUrl
  }: {
    mediaUrl?: string | null
    thumbnailUrl?: string | null
  }): FeedMediaAsset | null => {
    if (!mediaUrl || !isVideoUrl(mediaUrl)) {
      return null
    }

    return {
      url: mediaUrl,
      kind: 'video',
      posterUrl: thumbnailUrl && !isVideoUrl(thumbnailUrl) ? thumbnailUrl : undefined
    }
  }

  const directImage = pickImage({
    mediaUrl: post.media_url,
    thumbnailUrl: post.thumbnail_url
  })

  if (directImage) {
    return directImage
  }

  const children = post.children?.data ?? []
  for (const child of children) {
    const childImage = pickImage({
      mediaUrl: child.media_url,
      thumbnailUrl: child.thumbnail_url
    })

    if (childImage) {
      return childImage
    }
  }

  const directVideo = pickVideo({
    mediaUrl: post.media_url,
    thumbnailUrl: post.thumbnail_url
  })

  if (directVideo) {
    return directVideo
  }

  for (const child of children) {
    const childVideo = pickVideo({
      mediaUrl: child.media_url,
      thumbnailUrl: child.thumbnail_url
    })

    if (childVideo) {
      return childVideo
    }
  }

  return null
}

type FeedItem = {
  id: string
  permalink?: string
  caption?: string | null
  mediaUrl: string
  posterUrl?: string
  mediaKind: 'image' | 'video'
  mediaType?: InstagramPost['media_type']
}

export default async function InstagramFeed({
  title = 'Instagram',
  description = 'Les dernières images partagées sur @guide.landes.paysbasque.',
  limit = 6,
  ctaLabel = 'Voir sur Instagram',
  usernameOverride
}: InstagramFeedProps) {
  const instagramDebugEnabled = ['1', 'true', 'on'].includes(
    (process.env.INSTAGRAM_DEBUG ?? '').toLowerCase()
  )
  let posts: InstagramPost[] = []
  let errorMessage: string | null = null
  let debugDetails: string | null = null

  try {
    posts = await getInstagramPosts({ limit })
  } catch (error) {
    console.error('InstagramFeed: impossible de charger le flux', error)
    errorMessage = 'Impossible de charger les publications Instagram pour le moment.'
    debugDetails = error instanceof Error ? error.message : JSON.stringify(error)
  }

  if (!posts.length && !errorMessage && instagramDebugEnabled) {
    debugDetails = 'La réponse Instagram ne contient aucun média.'
  }

  if (!posts.length && errorMessage) {
    return (
      <section className="home-block -mb-[120px] z-10">
        <div className="container mx-auto px-6">
          <div className="rounded-2xl border border-black/10 bg-white px-6 py-10 text-center">
            <h2 className="font-custom text-4xl md:text-6xl">{title}</h2>
            <p className="mt-4 text-base text-neutral-600">{errorMessage}</p>
            {instagramDebugEnabled && debugDetails ? (
              <p className="mt-2 text-xs text-neutral-400">{debugDetails}</p>
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  const feedItems = posts.reduce<FeedItem[]>((acc, post) => {
    const media = getPostMediaAsset(post)

    if (!media) {
      return acc
    }

    acc.push({
      id: post.id,
      permalink: post.permalink,
      mediaUrl: media.url,
      posterUrl: media.posterUrl,
      mediaKind: media.kind,
      mediaType: post.media_type,
      caption: truncateCaption(post.caption)
    })

    return acc
  }, [])

  const hasEmbeds = feedItems.length > 0
  const username = usernameOverride ?? posts[0]?.username ?? ''
  const profileUrl = username ? `https://www.instagram.com/${username.replace(/^@/, '')}/` : undefined

  return (
    <section className="home-block">
      <div className="relative -mb-[60px] md:-mb-[120px] z-10">
        {hasEmbeds ? (
          <div className="-mx-6 md:mx-0">
            <div className="flex snap-x snap-mandatory overflow-x-auto gap-[2px] pl-6 md:pl-0">
              {feedItems.map((item) => (
                <a
                  key={item.id}
                  href={item.permalink ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative w-[44vw] h-[44vw] sm:w-[200px] sm:h-[200px] md:w-[220px] md:h-[220px] flex-shrink-0 overflow-hidden snap-start"
                  aria-label="Voir sur Instagram"
                >
                  <div className="absolute inset-0 bg-neutral-900/0 transition duration-300 group-hover:bg-neutral-900/50" />
                  {item.mediaKind === 'video' ? (
                    <video
                      src={item.mediaUrl}
                      poster={item.posterUrl}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Image
                      src={item.mediaUrl}
                      alt={item.caption ?? 'Instagram'}
                      fill
                      sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 60vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      priority={false}
                    />
                  )}

                  <div className="pointer-events-none inset-0 flex flex-col justify-between text-white opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/80">
                      {/* <span>Instagram</span>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-white"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm9 2a1 1 0 100 2 1 1 0 000-2zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3z" />
                      </svg> */}
                    </div>
                    {/* {item.caption ? (
                      <p
                        className="text-sm leading-snug text-white"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {item.caption}
                      </p>
                    ) : null} */}
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-black/20 px-6 py-10 text-center text-sm text-neutral-500">
            Aucune publication Instagram n’est disponible pour le moment.
            {instagramDebugEnabled && debugDetails ? (
              <span className="mt-2 block text-xs text-neutral-400">{debugDetails}</span>
            ) : null}
          </p>
        )}
      </div>
    </section>
  )
}
