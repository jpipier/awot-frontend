import { notFound } from 'next/navigation'
import Footer from '@/components/footer/Footer'
import PostFooter from '@/components/footer/PostFooter'
import ElementorStylesLoader from '@/components/ElementorStylesLoader'
import ElementorScriptsLoader from '@/components/ElementorScriptsLoader'
import StickyWatcher from '@/components/article/StickyWatcher'
import ElementorHeadingAnimator from '@/components/article/ElementorHeadingAnimator'
import { getArticleBySlug, getElementorCssBundle, getElementorJsAssets } from '@/lib/article'
import PostHero from '@/components/article/PostHero'

interface ArticlePageProps {
  params: {
    slug: string[]
  }
}

function extractElementorBodyClasses(content?: string | null) {
  if (!content) {
    return []
  }

  const match = content.match(/<div[^>]+class="([^"]*elementor[^"]*)"[^>]*>/i)

  if (!match) {
    return []
  }

  return match[1]
    .split(/\s+/)
    .map((cls) => cls.trim())
    .filter((cls) => cls.length > 0)
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const slugSegment = Array.isArray(params.slug) ? params.slug[params.slug.length - 1] : params.slug
  const article = await getArticleBySlug(slugSegment)

  if (!article) {
    notFound()
  }

  const cssBundle = await getElementorCssBundle()
  const elementorAssets = await getElementorJsAssets(article.databaseId ?? undefined, article.uri ?? undefined)
  const isElementor = article.isBuiltWithElementor !== false
  const fallbackBodyClasses = isElementor ? extractElementorBodyClasses(article.elementorContent) : []
  const bodyClasses = [
    ...fallbackBodyClasses,
    ...(article.hasVcShortcodes ? ['built-with-vc'] : [])
  ]

  return (
    <div className="article-container font-brandon_grotesquelight overflow-x-hidden">
      <ElementorStylesLoader cssBundle={cssBundle} bodyClasses={bodyClasses.length ? bodyClasses : undefined} isBuiltWithElementor={isElementor} />
      <ElementorScriptsLoader assets={elementorAssets} />
      <ElementorHeadingAnimator />
      <StickyWatcher />
      <PostHero article={article} />
      <section className="elementor-section elementor-section-height-default elementor-element-40717a53">
        <div
          className="contentElementor font-montserrat"
          dangerouslySetInnerHTML={{ __html: article.elementorContent ?? article.content ?? '' }}
        />
      </section>
      <PostFooter
        categories={article.categories?.edges?.map((e) => e.node)}
        excludeSlug={article.slug}
      />
      <Footer postId={article.databaseId} />
    </div>
  )
}
