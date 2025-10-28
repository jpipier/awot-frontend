import { notFound } from 'next/navigation'
import Footer from '@/components/footer/Footer'
import ElementorStylesLoader from '@/components/ElementorStylesLoader'
import { getPageByUri } from '@/lib/pages'
import { getElementorCssFiles } from '@/lib/article'

interface GenericPageProps {
  params: {
    slug: string[]
  }
}

export default async function GenericPage({ params }: GenericPageProps) {
  const segments = params.slug ?? []
  const uri = `/${segments.join('/')}/`
  const page = await getPageByUri(uri)

  if (!page) {
    notFound()
  }

  const cssFiles = await getElementorCssFiles()

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <ElementorStylesLoader cssFiles={cssFiles} />
      <h1 className="mb-6 text-4xl font-custom">{page.title}</h1>
      <div className="contentElementor" dangerouslySetInnerHTML={{ __html: page.elementorContent ?? page.content ?? '' }} />
      <Footer postId={page.databaseId} />
    </div>
  )
}
