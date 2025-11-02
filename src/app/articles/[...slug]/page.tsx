import { notFound } from 'next/navigation'
import Footer from '@/components/footer/Footer'
import PostFooter from '@/components/footer/PostFooter'
import ElementorStylesLoader from '@/components/ElementorStylesLoader'
import StickyWatcher from '@/components/article/StickyWatcher'
import { getArticleBySlug, getElementorCssFiles } from '@/lib/article'

interface ArticlePageProps {
  params: {
    slug: string[]
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const slugSegment = Array.isArray(params.slug) ? params.slug[params.slug.length - 1] : params.slug
  const article = await getArticleBySlug(slugSegment)

  if (!article) {
    notFound()
  }

  const cssFiles = await getElementorCssFiles()

  return (
    <div className="article-container font-brandon_grotesquelight">
      <ElementorStylesLoader cssFiles={cssFiles} bodyClasses={article.elementorBodyClasses ?? undefined} />
      <StickyWatcher />
      <section className="elementor-section elementor-section-height-default elementor-element-40717a53" id="sticky-anchor">
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
