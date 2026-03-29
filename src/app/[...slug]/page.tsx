import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ElementorStylesLoader from '@/components/ElementorStylesLoader'
import ElementorScriptsLoader from '@/components/ElementorScriptsLoader'
import Footer from '@/components/footer/Footer'
import PageDebugLogger from '@/components/PageDebugLogger'
import { getPageByUri } from '@/lib/pages'
import { getElementorCssBundle, getElementorJsAssets } from '@/lib/article'
import { hasWordPressEditorSessionCookie } from '@/lib/wordpress'
import { getYoastMetadataForPageSlug, getYoastMetadataForWpUrl, mergeMetadataWithFallback, toSeoDescription } from '@/lib/seo'
import { sanitizeExcerptText } from '@/lib/sanitize-excerpt-text'

interface GenericPageProps {
  params: {
    slug: string[]
  }
}

export async function generateMetadata({ params }: GenericPageProps): Promise<Metadata> {
  const segments = params.slug ?? []
  const path = segments.join('/')
  const uri = path ? `/${path}/` : '/'
  const page = await getPageByUri(uri)

  if (!page) {
    return {
      title: 'Page introuvable',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const title = sanitizeExcerptText(page.title)
  const description = toSeoDescription(page.content ?? page.elementorContent)
  const fallback: Metadata = {
    title: title || 'Page',
    description: description || 'A Way of Travel',
    alternates: {
      canonical: path ? `/${path}` : '/'
    }
  }

  const yoastMetadata =
    (page.slug ? await getYoastMetadataForPageSlug(page.slug) : null) ??
    (await getYoastMetadataForWpUrl(page.link ?? page.uri ?? uri))
  return mergeMetadataWithFallback(yoastMetadata, fallback)
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

export default async function GenericPage({ params }: GenericPageProps) {
  const segments = params.slug ?? []
  const path = segments.join('/')
  const uri = path ? `/${path}/` : '/'
  const canEdit = hasWordPressEditorSessionCookie()
  const page = await getPageByUri(uri)

  if (!page) {
    notFound()
  }

  const cssBundle = await getElementorCssBundle({ postId: page.databaseId ?? undefined })
  const elementorAssets = await getElementorJsAssets(page.databaseId ?? undefined, page.uri ?? uri)
  const hasElementorMarkup = Boolean(page.elementorContent?.trim())
  const isElementor = page.isBuiltWithElementor !== false || hasElementorMarkup
  const fallbackBodyClasses = isElementor ? extractElementorBodyClasses(page.elementorContent ?? page.content) : []
  const isHomePage = page.isFrontPage || page.uri === '/' || uri === '/'
  const shouldDisplayHeading = !(page.elementorContent && page.elementorContent.trim().length > 0)

  return (
    <div className="">
      <ElementorStylesLoader
        cssBundle={cssBundle}
        bodyClasses={isElementor && fallbackBodyClasses.length ? fallbackBodyClasses : undefined}
        isBuiltWithElementor={isElementor}
      />
      <ElementorScriptsLoader assets={elementorAssets} />
      <PageDebugLogger label="isHomePage" value={isHomePage} />
      {shouldDisplayHeading ? <h1 className="mb-6 text-4xl font-custom">{page.title}</h1> : null}
      {!isHomePage ? (
        <div
          className="contentElementor font-montserrat"
          dangerouslySetInnerHTML={{ __html: page.elementorContent ?? page.content ?? '' }}
        />
      ) : null}
      <Footer postId={page.databaseId} canEdit={canEdit} />
    </div>
  )
}
