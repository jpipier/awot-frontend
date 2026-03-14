import { notFound } from 'next/navigation'
import ElementorStylesLoader from '@/components/ElementorStylesLoader'
import ElementorScriptsLoader from '@/components/ElementorScriptsLoader'
import ContactForm from '@/components/contact/ContactForm'
import Footer from '@/components/footer/Footer'
import { getPageByUri } from '@/lib/pages'
import { getElementorCssBundle, getElementorJsAssets } from '@/lib/article'

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

export default async function ContactPage() {
  const uri = '/contact/'
  const page = await getPageByUri(uri)

  if (!page) {
    notFound()
  }

  const cssBundle = await getElementorCssBundle()
  const elementorAssets = await getElementorJsAssets(page.databaseId ?? undefined, page.uri ?? uri)
  const isElementor = page.isBuiltWithElementor !== false
  const fallbackBodyClasses = isElementor ? extractElementorBodyClasses(page.elementorContent ?? page.content) : []
  const shouldDisplayHeading = !(page.elementorContent && page.elementorContent.trim().length > 0)
  const contentMarkup = page.elementorContent ?? page.content ?? ''

  return (
    <div>
      <ElementorStylesLoader
        cssBundle={cssBundle}
        bodyClasses={isElementor && fallbackBodyClasses.length ? fallbackBodyClasses : undefined}
        isBuiltWithElementor={isElementor}
      />
      <ElementorScriptsLoader assets={elementorAssets} />
      {contentMarkup ? (
        <div
          className="contentElementor font-montserrat"
          dangerouslySetInnerHTML={{ __html: contentMarkup }}
        />
      ) : null}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6 mt-20">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-custom">Contactez-nous !</h2>
            <ContactForm />
          </div>
        </div>
      </section>
      <Footer postId={page.databaseId} />
    </div>
  )
}
