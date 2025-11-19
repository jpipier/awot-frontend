import { notFound } from 'next/navigation'
import Footer from '@/components/footer/Footer'
import PostFooter from '@/components/footer/PostFooter'
import ElementorStylesLoader from '@/components/ElementorStylesLoader'
import ElementorScriptsLoader from '@/components/ElementorScriptsLoader'
import StickyWatcher from '@/components/article/StickyWatcher'
import ElementorHeadingAnimator from '@/components/article/ElementorHeadingAnimator'
import { getArticleBySlug, getElementorCssBundle, getElementorJsAssets } from '@/lib/article'

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
  const fallbackBodyClasses = extractElementorBodyClasses(article.elementorContent ?? article.content)

  return (
    <div className="article-container font-brandon_grotesquelight">
      <ElementorStylesLoader cssBundle={cssBundle} bodyClasses={fallbackBodyClasses.length ? fallbackBodyClasses : undefined} />
      <ElementorScriptsLoader assets={elementorAssets} />
      <ElementorHeadingAnimator />
      <StickyWatcher />
      <section className="elementor-section elementor-section-height-default elementor-element-40717a53">
        <div
          className="contentElementor"
          dangerouslySetInnerHTML={{ __html: article.elementorContent ?? article.content ?? '' }}
        />
      </section>
      <PostFooter />
      <Footer postId={article.databaseId} />
    </div>
  )
}
