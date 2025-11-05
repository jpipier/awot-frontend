import Image from 'next/image'
import Link from 'next/link'
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

function getImageUrl(post: InstagramPost) {
  if (post.media_type === 'VIDEO' && post.thumbnail_url) {
    return post.thumbnail_url
  }

  return post.media_url
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

function formatFrenchDate(timestamp?: string | null) {
  if (!timestamp) {
    return null
  }

  const parsed = new Date(timestamp)

  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(parsed)
}

export default async function InstagramFeed({
  title = 'Instagram',
  description = 'Les dernières images partagées sur @guideawayoftravel.',
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
      <section className="home-block -mb-[120px] z-10" >
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

  const hasPosts = posts.length > 0
  const username = usernameOverride ?? posts[0]?.username ?? ''
  const profileUrl = username ? `https://www.instagram.com/${username.replace(/^@/, '')}/` : undefined

  return (
    <section className="home-block">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-6 pb-6 text-left md:flex-row md:items-end md:justify-between">
          <div>
            <p className="uppercase tracking-[0.4em] text-xs text-neutral-500">Instagram</p>
            <h2 className="font-custom text-4xl leading-tight md:text-7xl">{title}</h2>
            {description ? <p className="mt-3 max-w-2xl text-base text-neutral-600">{description}</p> : null}
          </div>
          {profileUrl ? (
            <Link
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-black px-6 py-2 text-sm font-semibold uppercase tracking-wide transition hover:bg-black hover:text-white"
            >
              {ctaLabel}
            </Link>
          ) : null}
        </div>

        {hasPosts ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const imageUrl = getImageUrl(post)
              const preview = truncateCaption(post.caption)
              const frenchDate = formatFrenchDate(post.timestamp)

              return (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col rounded-2xl border border-black/10 bg-white p-4 transition hover:-translate-y-1 hover:shadow-xl"
                  aria-label={post.caption ? `Ouvrir la publication Instagram: ${post.caption}` : 'Ouvrir la publication Instagram'}
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                    <Image
                      src={imageUrl}
                      alt={post.caption ? post.caption : 'Publication Instagram'}
                      fill
                      sizes="(min-width: 1024px) 25vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  {frenchDate ? (
                    <p className="mt-4 text-xs uppercase tracking-[0.28em] text-neutral-500">{frenchDate}</p>
                  ) : null}
                  {preview ? <p className="mt-2 text-sm text-neutral-800">{preview}</p> : null}
                </a>
              )
            })}
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
