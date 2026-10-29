import { SITE_DESCRIPTION, SITE_NAME } from './site-config'

type JsonLd = Record<string, unknown>

function cleanObject<T extends JsonLd>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as T
}

function absolute(origin: string, path: string) {
  try {
    return new URL(path, origin).toString()
  } catch {
    return undefined
  }
}

export function buildWebSiteJsonLd(origin: string, sameAs: string[] = []): JsonLd[] {
  const organizationId = `${origin}/#organization`

  return [
    cleanObject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: `${origin}/`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: 'fr-FR',
      publisher: { '@id': organizationId }
    }),
    cleanObject({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      name: SITE_NAME,
      url: `${origin}/`,
      sameAs: sameAs.length ? sameAs : undefined
    })
  ]
}

export interface ArticleJsonLdInput {
  origin: string
  path: string
  title: string
  description?: string
  image?: string | null
  datePublished?: string | null
  dateModified?: string | null
  authorName?: string | null
  section?: string | null
}

export function buildArticleJsonLd(input: ArticleJsonLdInput): JsonLd {
  const url = absolute(input.origin, input.path)

  return cleanObject({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: url ? { '@type': 'WebPage', '@id': url } : undefined,
    headline: input.title.slice(0, 110),
    description: input.description,
    image: input.image ? [input.image] : undefined,
    datePublished: input.datePublished ?? undefined,
    dateModified: input.dateModified ?? input.datePublished ?? undefined,
    articleSection: input.section ?? undefined,
    inLanguage: 'fr-FR',
    author: input.authorName ? { '@type': 'Person', name: input.authorName } : { '@id': `${input.origin}/#organization` },
    publisher: { '@id': `${input.origin}/#organization` }
  })
}

export interface BreadcrumbItem {
  name: string
  path: string
}

export function buildBreadcrumbJsonLd(origin: string, items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(origin, item.path)
    }))
  }
}
