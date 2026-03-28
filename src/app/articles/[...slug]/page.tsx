import { draftMode } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Footer from '@/components/footer/Footer'
import PostFooter from '@/components/footer/PostFooter'
import ElementorStylesLoader from '@/components/ElementorStylesLoader'
import ElementorScriptsLoader from '@/components/ElementorScriptsLoader'
import StickyWatcher from '@/components/article/StickyWatcher'
import ElementorHeadingAnimator from '@/components/article/ElementorHeadingAnimator'
import { getArticleByDatabaseId, getArticleBySlug, getElementorCssBundle, getElementorJsAssets } from '@/lib/article'
import { hasWordPressEditorSessionCookie } from '@/lib/wordpress'
import PostHero from '@/components/article/PostHero'

interface ArticlePageProps {
  params: {
    slug: string[]
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
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

function getFirstSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const slugSegments = Array.isArray(params.slug) ? params.slug : [params.slug]
  const previewId = slugSegments[0] === 'preview' ? Number.parseInt(slugSegments[1] ?? '', 10) : null
  const isPreviewRoute = Boolean(previewId && Number.isInteger(previewId) && previewId > 0)
  const canEdit = hasWordPressEditorSessionCookie()
  let article = null

  if (isPreviewRoute) {
    if (!previewId) {
      notFound()
    }

    if (!canEdit) {
      notFound()
    }

    if (!draftMode().isEnabled) {
      const previewSearch = new URLSearchParams({
        p: String(previewId),
        preview: 'true'
      })
      const secret = getFirstSearchParam(searchParams?.secret) ?? getFirstSearchParam(searchParams?.preview_secret)

      if (secret) {
        previewSearch.set('secret', secret)
      }

      redirect(`/api/preview?${previewSearch.toString()}`)
    }

    article = await getArticleByDatabaseId(previewId, { asPreview: true })
  } else {
    const slugSegment = slugSegments[slugSegments.length - 1]
    article = await getArticleBySlug(slugSegment)
  }

  if (!article) {
    notFound()
  }

  const [cssBundle, elementorAssets] = await Promise.all([
    getElementorCssBundle({
      postId: article.databaseId ?? previewId ?? undefined,
      preview: isPreviewRoute
    }),
    getElementorJsAssets(article.databaseId ?? undefined, article.uri ?? undefined)
  ])
  const hasElementorMarkup = Boolean(article.elementorContent?.trim())
  const isElementor = article.isBuiltWithElementor !== false || hasElementorMarkup
  const fallbackBodyClasses = isElementor ? extractElementorBodyClasses(article.elementorContent) : []
  const bodyClasses = [
    ...fallbackBodyClasses,
    ...(article.hasVcShortcodes ? ['built-with-vc'] : []),
    ...(article.hasClassicEditor ? ['built-with-classic'] : [])
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
      <Footer postId={article.databaseId ?? previewId ?? undefined} canEdit={canEdit} />
    </div>
  )
}
