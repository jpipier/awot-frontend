import Link from 'next/link'
import Script from 'next/script'
import { getInstagramOEmbed, getInstagramPosts } from '@/lib/instagram'
import type { InstagramPost } from '@/types/instagram'

const CAPTION_PREVIEW_LENGTH = 110
const INSTAGRAM_EMBED_SCRIPT_SRC = 'https://www.instagram.com/embed.js'

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

function sanitizeEmbedHtml(html?: string | null) {
  if (!html) {
    return null
  }

  return html
    .replace(/<script[^>]*src=\"(?:https?:)?\/\/www\.instagram\.com\/embed\.js\"[^>]*><\/script>/gi, '')
    .trim()
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

  let embeds: Array<{ id: string; permalink: string; html: string; caption?: string | null }> = []
  const embedErrors: string[] = []

  if (posts.length) {
    const embedResponses = await Promise.all(
      posts.map(async (post) => {
        if (!post.permalink) {
          return null
        }

        try {
          const data = await getInstagramOEmbed(post.permalink, { maxwidth: 540, hidecaption: true })
          const sanitized = sanitizeEmbedHtml(data.html)

          if (!sanitized) {
            throw new Error('Instagram oEmbed n’a renvoyé aucun contenu HTML exploitable.')
          }

          return {
            id: post.id,
            permalink: post.permalink,
            html: sanitized,
            caption: truncateCaption(post.caption ?? data.title ?? undefined)
          }
        } catch (embedError) {
          console.error('InstagramFeed: échec du oEmbed', embedError)
          embedErrors.push(embedError instanceof Error ? embedError.message : String(embedError))
          return null
        }
      })
    )

    embeds = embedResponses.filter((item): item is NonNullable<typeof item> => Boolean(item))
  }

  if (!embeds.length && embedErrors.length && !errorMessage) {
    errorMessage = 'Impossible de charger les publications Instagram pour le moment.'
    if (instagramDebugEnabled) {
      debugDetails = embedErrors.join(' | ')
    }
  }

  const hasEmbeds = embeds.length > 0
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

        {hasEmbeds ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {embeds.map((embed) => (
              <div
                key={embed.id}
                className="rounded-2xl border border-black/10 bg-white p-3 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="instagram-embed"
                  dangerouslySetInnerHTML={{ __html: embed.html }}
                />
                {embed.caption ? <p className="mt-3 text-xs text-neutral-600">{embed.caption}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-black/20 px-6 py-10 text-center text-sm text-neutral-500">
            Aucune publication Instagram n’est disponible pour le moment.
            {instagramDebugEnabled && debugDetails ? (
              <span className="mt-2 block text-xs text-neutral-400">{debugDetails}</span>
            ) : null}
          </p>
        )}
        {hasEmbeds ? (
          <Script src={INSTAGRAM_EMBED_SCRIPT_SRC} strategy="lazyOnload" />
        ) : null}
      </div>
    </section>
  )
}
