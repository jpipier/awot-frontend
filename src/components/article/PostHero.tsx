import type { Article } from '@/types/wordpress'
import PostHeroMedia from './PostHeroMedia'

interface PostHeroProps {
  article: Article
}

export default function PostHero({ article }: PostHeroProps) {
  const heroVideo = article.optionsArticles?.video?.node
  const portraitImage = article.optionsArticles?.imagePortait?.node
  const heroImage = portraitImage ?? article.featuredImage?.node
  const imageSrc = heroImage?.sourceUrl ?? heroImage?.guid
  const imageSrcSet = heroImage?.srcSet?.trim() ? heroImage.srcSet : undefined
  const imageAlt = heroImage?.altText ?? article.title ?? ''
  const videoSrc = heroVideo?.sourceUrl ?? heroVideo?.mediaItemUrl ?? heroVideo?.guid

  const childCategory = article.categories?.edges
    ?.map((e) => e.node)
    ?.find((cat) => cat.parent?.node)

  const localisations = article.localisations?.edges?.map((e) => e.node) ?? []

  return (
    <div id="sticky-anchor" className="relative h-screen w-full mb-[4rem] md:mb-auto">
      {/* Image — pinned par StickyWatcher via #sticky1 */}
      <div
        id="sticky1"
        {...(videoSrc || imageSrc ? { 'data-header-dark': '' } : {})}
        className="w-full md:w-1/2 h-2/3 md:h-screen md:p-[2.05rem]"
      >
        <PostHeroMedia
          videoSrc={videoSrc}
          imageSrc={imageSrc}
          imageSrcSet={imageSrcSet}
          imageAlt={imageAlt}
        />
      </div>

      {/* Text — right side on desktop */}
      <div id="stickyTitle" className="md:absolute md:right-0 md:top-0 md:w-1/2 h-1/3 md:h-full flex flex-col items-center justify-center px-8 md:px-12">
        {childCategory?.name && (
          <span className="text-sm tracking-[0.2em] uppercase text-gray-500 mb-6">
            {childCategory.name}
          </span>
        )}

        <h1
          className="text-3xl md:text-4xl lg:text-5xl text-center font-schnyder_wide_xl_webdemi leading-tight"
          dangerouslySetInnerHTML={{ __html: article.title }}
        />

        {localisations.length > 0 && (
          <p className="mt-6 text-sm tracking-[0.15em] uppercase text-gray-500">
            {localisations.map((loc) => loc.name).join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}
