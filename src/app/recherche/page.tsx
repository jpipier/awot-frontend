import type { Metadata } from 'next'
import Search from '@/components/search/Search'
import EditorialPostGrid from '@/components/listing/EditorialPostGrid'
import { searchPostsByTerm } from '@/lib/search'

interface SearchPageProps {
  searchParams?: {
    term?: string | string[]
    q?: string | string[]
  }
}

const getFirstParamValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }

  return value ?? ''
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const term =
    getFirstParamValue(searchParams?.term).trim() || getFirstParamValue(searchParams?.q).trim()

  return {
    title: term || 'Recherche'
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const term =
    getFirstParamValue(searchParams?.term).trim() || getFirstParamValue(searchParams?.q).trim()
  const posts = term.length >= 3 ? await searchPostsByTerm(term, 180) : []
  const resultsLabel = term
    ? `${posts.length} résultat${posts.length > 1 ? 's' : ''} pour ${term}`
    : 'Trouvez une adresse, une idée ou une destination'
  const emptyMessage =
    term.length >= 3
      ? 'Aucun article pour cette recherche.'
      : 'Saisissez au moins 3 caractères pour lancer une recherche.'

  return (
    <div className="template-categories">
      <div className="mx-auto max-w-[1120px] px-6 pb-24 pt-16 md:px-10 md:pb-32 md:pt-24">
        <header className="mb-14 text-center md:mb-20">
          <h1 className="font-schnyder_wide_xl_webdemi text-[14vw] leading-[0.95] md:text-[86px]">
            Recherche
          </h1>
          <div className="mx-auto mt-4 h-px w-32 bg-black/40" />
          <p className="mt-4 font-montserrat text-[10px] uppercase tracking-[0.35em] text-black/70">
            {resultsLabel}
          </p>
        </header>

        <div className="mb-14 md:mb-20">
          <Search initialQuery={term} />
        </div>

        <EditorialPostGrid posts={posts} emptyMessage={emptyMessage} revealKey={term || 'search-empty'} />
      </div>
    </div>
  )
}
