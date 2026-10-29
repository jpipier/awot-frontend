import type { Metadata } from 'next'
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
import { getArticleLandscapeImage, getArticlePortraitImage } from '@/lib/article-card'
import { getYoastMetadataForPostSlug, getYoastMetadataForWpUrl, mergeMetadataWithFallback, toSeoDescription } from '@/lib/seo'
import { sanitizeExcerptText } from '@/lib/sanitize-excerpt-text'
import { SITE_DESCRIPTION, SITE_NAME, isArchiveNoindexEnabled, isArchiveOnly } from '@/lib/site-config'
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from '@/lib/structured-data'
import { getMetadataBaseUrl } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

interface ArticlePageProps {
  params: {
    slug: string[]
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
  }
}

function resolveArticleSlugSegments(params: ArticlePageProps['params']) {
  return Array.isArray(params.slug) ? params.slug : [params.slug]
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const slugSegments = resolveArticleSlugSegments(params)
  const previewId = slugSegments[0] === 'preview' ? Number.parseInt(slugSegments[1] ?? '', 10) : null
  const isPreviewRoute = Boolean(previewId && Number.isInteger(previewId) && previewId > 0)

  if (isPreviewRoute) {
    return {
      title: 'Apercu article',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const slugSegment = slugSegments[slugSegments.length - 1]
  const article = await getArticleBySlug(slugSegment)

  if (!article) {
    return {
      title: 'Article introuvable',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const title = sanitizeExcerptText(article.title)
  const description = toSeoDescription(article.excerpt ?? article.content ?? article.elementorContent)
  const image = getArticleLandscapeImage(article) || getArticlePortraitImage(article)

  const fallback: Metadata = {
    title: title || 'Article',
    description: description || SITE_DESCRIPTION,
    alternates: {
      canonical: article.slug ? `/articles/${article.slug}` : undefined
    },
    openGraph: {
      type: 'article',
      title: title || undefined,
      description: description || undefined,
      ...(image ? { images: [{ url: image }] } : {})
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: title || undefined,
      description: description || undefined,
      ...(image ? { images: [image] } : {})
    }
  }

  const yoastMetadata =
    (await getYoastMetadataForPostSlug(slugSegment)) ??
    (await getYoastMetadataForWpUrl(article.uri ?? `/${slugSegment}/`))
  const merged = mergeMetadataWithFallback(yoastMetadata, fallback)

  if (isArchiveNoindexEnabled() && isArchiveOnly(getArticleCategorySlugs(article))) {
    return { ...merged, robots: { index: false, follow: true } }
  }

  return merged
}

function getArticleCategorySlugs(article: { categories?: { edges?: Array<{ node: { slug?: string | null } }> } }) {
  return (article.categories?.edges ?? []).map((edge) => edge.node?.slug)
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
  const slugSegments = resolveArticleSlugSegments(params)
  const previewId = slugSegments[0] === 'preview' ? Number.parseInt(slugSegments[1] ?? '', 10) : null
  const isPreviewRoute = Boolean(previewId && Number.isInteger(previewId) && previewId > 0)
  const configuredPreviewSecret = process.env.WORDPRESS_PREVIEW_SECRET?.trim() ?? null
  const canEdit = hasWordPressEditorSessionCookie()
  let article = null

  if (isPreviewRoute) {
    if (!previewId) {
      notFound()
    }

    const providedSecret =
      getFirstSearchParam(searchParams?.secret) ?? getFirstSearchParam(searchParams?.preview_secret)

    if (!configuredPreviewSecret || providedSecret !== configuredPreviewSecret) {
      notFound()
    }

    if (!draftMode().isEnabled) {
      const previewSearch = new URLSearchParams({
        p: String(previewId),
        preview: 'true'
      })
      previewSearch.set('secret', providedSecret)

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

  const siteOrigin = getMetadataBaseUrl()?.origin
  const articlePath = article.slug ? `/articles/${article.slug}` : null
  const articleTitle = sanitizeExcerptText(article.title)
  const mainCategory = article.categories?.edges?.[0]?.node
  const articleImage = getArticleLandscapeImage(article) || getArticlePortraitImage(article)
  const jsonLd =
    siteOrigin && articlePath && !isPreviewRoute
      ? [
          buildArticleJsonLd({
            origin: siteOrigin,
            path: articlePath,
            title: articleTitle || SITE_NAME,
            description: toSeoDescription(article.excerpt ?? article.content ?? article.elementorContent) || undefined,
            image: articleImage,
            datePublished: article.date,
            dateModified: article.modified,
            authorName: article.author?.node?.name,
            section: mainCategory?.name
          }),
          buildBreadcrumbJsonLd(siteOrigin, [
            { name: 'Accueil', path: '/' },
            ...(mainCategory?.slug && mainCategory.name
              ? [{ name: mainCategory.name, path: `/categories/${mainCategory.slug}` }]
              : []),
            { name: articleTitle || SITE_NAME, path: articlePath }
          ])
        ]
      : null

  return (
    <div className="article-container font-brandon_grotesquelight overflow-x-hidden">
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
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
