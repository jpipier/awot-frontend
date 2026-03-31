import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ElementorStylesLoader from '@/components/ElementorStylesLoader'
import ElementorScriptsLoader from '@/components/ElementorScriptsLoader'
import ContactForm from '@/components/contact/ContactForm'
import Footer from '@/components/footer/Footer'
import { getPageByUri } from '@/lib/pages'
import { getElementorCssBundle, getElementorJsAssets } from '@/lib/article'
import { hasWordPressEditorSessionCookie } from '@/lib/wordpress'
import { getYoastMetadataForPageSlug, getYoastMetadataForWpUrl, mergeMetadataWithFallback, toSeoDescription } from '@/lib/seo'
import { sanitizeExcerptText } from '@/lib/sanitize-excerpt-text'

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

export async function generateMetadata(): Promise<Metadata> {
  const uri = '/contact/'
  const page = await getPageByUri(uri)

  if (!page) {
    return {
      title: 'Contact',
      robots: {
        index: false,
        follow: false
      }
    }
  }

  const fallback: Metadata = {
    title: sanitizeExcerptText(page.title) || 'Contact',
    description: toSeoDescription(page.content ?? page.elementorContent) || 'Contactez-nous.',
    alternates: {
      canonical: '/contact'
    }
  }

  const yoastMetadata =
    (page.slug ? await getYoastMetadataForPageSlug(page.slug) : null) ??
    (await getYoastMetadataForWpUrl(page.link ?? page.uri ?? uri))
  return mergeMetadataWithFallback(yoastMetadata, fallback)
}

export default async function ContactPage() {
  const uri = '/contact/'
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
  const contentMarkup = page.elementorContent ?? page.content ?? ''
  const headingMarkup = page.title?.trim() || 'Contact'

  return (
    <div className="article-container contact-page-shell font-brandon_grotesquelight overflow-x-hidden">
      <ElementorStylesLoader
        cssBundle={cssBundle}
        bodyClasses={isElementor && fallbackBodyClasses.length ? fallbackBodyClasses : undefined}
        isBuiltWithElementor={isElementor}
      />
      <ElementorScriptsLoader assets={elementorAssets} />
      <section className={`contact-page-hero${contentMarkup ? '' : ' contact-page-hero--without-media'}`}>
        {contentMarkup ? (
          <div className="contact-page-media-panel h-[100vh] overflow-hidden">
            <div className="contact-page-media-frame">
              <div
                className="contact-page-media contentElementor font-montserrat text-left [&_br]:inline [&_h1]:mb-4 [&_h1]:text-left [&_h1]:leading-tight [&_h2]:mb-4 [&_h2]:text-left [&_h2]:leading-tight [&_h3]:mb-4 [&_h3]:text-left [&_h3]:leading-tight [&_p]:mb-4 [&_p]:text-left [&_p]:leading-7 [&_p:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: contentMarkup }}
              />
            </div>
          </div>
        ) : null}
        <div className="contact-page-copy-panel">
          <div className="contact-page-copy-inner">
            <h1
              className="contact-page-title font-schnyder_wide_xl_webdemi"
              dangerouslySetInnerHTML={{ __html: headingMarkup }}
            />
            <p className="contact-page-intro font-montserrat">
              Une question, une idee de collaboration ou un projet a partager ? Envoyez-nous un message, nous revenons vers vous rapidement.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>
      <Footer postId={page.databaseId} canEdit={canEdit} />
    </div>
  )
}
