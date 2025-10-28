import Image from 'next/image'
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
      <ElementorStylesLoader cssFiles={cssFiles} />
      <StickyWatcher />
      <section className="elementor-section elementor-section-height-default elementor-element-40717a53" id="sticky-anchor">
        <div className="elementor-container elementor-column-gap-no">
          <div className="elementor-element elementor-element-5386998d elementor-top-column elementor-col-33" id="sticky1">
            <div className="elementor-widget-wrap elementor-element-populated">
              <div className="elementor-widget-container">
                {article.optionsArticles?.imagePortait?.node?.guid ? (
                  <div className="relative h-full w-full overflow-hidden">
                    <Image
                      src={article.optionsArticles.imagePortait.node.guid}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      unoptimized
                      priority
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div className="elementor-element elementor-element-55e1937d elementor-top-column elementor-col-33 main-content" id="stickyTitle">
            <div className="elementor-widget-wrap elementor-element-populated">
              <div className="elementor-widget-container">
                <ul className="elementor-inline-items elementor-icon-list-items elementor-post-info">
                  <li className="elementor-icon-list-item elementor-repeater-item-4926042 elementor-inline-item">
                    <span className="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-custom">
                      Flâner | Le guide
                    </span>
                  </li>
                </ul>
              </div>
              <div className="elementor-widget-container">
                <h1 className="elementor-heading-title elementor-size-small">{article.title}</h1>
              </div>
            </div>
          </div>
          <div className="elementor-element elementor-element-4cb8ff8 elementor-top-column elementor-col-33">
            <div className="elementor-widget-wrap" />
          </div>
        </div>
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
