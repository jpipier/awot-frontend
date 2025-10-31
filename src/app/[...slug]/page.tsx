import { notFound } from 'next/navigation'
import ElementorStylesLoader from '@/components/ElementorStylesLoader'
import Footer from '@/components/footer/Footer'
import PageDebugLogger from '@/components/PageDebugLogger'
import { getPageByUri } from '@/lib/pages'
import { getElementorCssFiles } from '@/lib/article'

interface GenericPageProps {
  params: {
    slug: string[]
  }
}

export default async function GenericPage({ params }: GenericPageProps) {
  const segments = params.slug ?? []
  const path = segments.join('/')
  const uri = path ? `/${path}/` : '/'
  const page = await getPageByUri(uri)

  if (!page) {
    notFound()
  }

  const cssFiles = await getElementorCssFiles()
  const isHomePage = page.isFrontPage || page.uri === '/' || uri === '/'

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <ElementorStylesLoader cssFiles={cssFiles} />
      <PageDebugLogger label="isHomePage" value={isHomePage} />
      <h1 className="mb-6 text-4xl font-custom">{page.title}</h1>
      {!isHomePage ? (
        <div
          className="contentElementor"
          dangerouslySetInnerHTML={{ __html: page.elementorContent ?? page.content ?? '' }}
        />
      ) : null}
      <Footer postId={page.databaseId} />
    </div>
  )
}
