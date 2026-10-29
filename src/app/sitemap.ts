import type { MetadataRoute } from 'next'
import { fetchWordPressRest } from '@/lib/wordpress'
import { getMetadataBaseUrl } from '@/lib/seo'
import { getArchiveCategoryId, getArchiveCategorySlugs, isArchiveNoindexEnabled } from '@/lib/site-config'

export const revalidate = 1800

const MAX_PER_PAGE = 100
const MAX_PAGES = 200

interface RestPostRecord {
  slug?: string
  status?: string
  modified_gmt?: string
  categories?: number[]
}

interface RestPageRecord {
  link?: string
  status?: string
  modified_gmt?: string
}

interface RestCategoryRecord {
  slug?: string
  count?: number
}

function normalizePath(path: string) {
  if (!path) {
    return '/'
  }

  if (path !== '/' && path.endsWith('/')) {
    return path.slice(0, -1)
  }

  return path
}

function parseWpDate(value: string | undefined) {
  if (!value) {
    return undefined
  }

  const normalized = value.endsWith('Z') ? value : `${value}Z`
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toAbsoluteUrl(path: string, origin: string) {
  return new URL(normalizePath(path), origin).toString()
}

function extractPathnameFromAbsoluteUrl(value: string | undefined) {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    return normalizePath(url.pathname || '/')
  } catch {
    return null
  }
}

async function fetchAllRestRecords<T>(endpoint: string) {
  const allRecords: T[] = []

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    try {
      const chunk = await fetchWordPressRest<T[]>(
        `${endpoint}${endpoint.includes('?') ? '&' : '?'}per_page=${MAX_PER_PAGE}&page=${page}`,
        { next: { revalidate } }
      )

      if (!Array.isArray(chunk) || chunk.length === 0) {
        break
      }

      allRecords.push(...chunk)

      if (chunk.length < MAX_PER_PAGE) {
        break
      }
    } catch {
      break
    }
  }

  return allRecords
}

function dedupeSitemapEntries(entries: MetadataRoute.Sitemap) {
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>()

  entries.forEach((entry) => {
    const existing = byUrl.get(entry.url)

    if (!existing) {
      byUrl.set(entry.url, entry)
      return
    }

    const existingTime = existing.lastModified ? new Date(existing.lastModified).getTime() : 0
    const currentTime = entry.lastModified ? new Date(entry.lastModified).getTime() : 0

    byUrl.set(entry.url, currentTime > existingTime ? entry : existing)
  })

  return Array.from(byUrl.values())
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const metadataBase = getMetadataBaseUrl()
  const origin = metadataBase?.origin

  if (!origin) {
    return []
  }

  const [posts, pages, categories] = await Promise.all([
    fetchAllRestRecords<RestPostRecord>('wp/v2/posts?_fields=slug,status,modified_gmt,categories'),
    fetchAllRestRecords<RestPageRecord>('wp/v2/pages?_fields=link,status,modified_gmt'),
    fetchAllRestRecords<RestCategoryRecord>('wp/v2/categories?_fields=slug,count')
  ])

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl('/', origin),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: toAbsoluteUrl('/contact', origin),
      changeFrequency: 'monthly',
      priority: 0.6
    }
  ]

  const excludeArchives = isArchiveNoindexEnabled()
  const archiveCategoryId = getArchiveCategoryId()
  const archiveSlugs = new Set(getArchiveCategorySlugs())

  const postEntries: MetadataRoute.Sitemap = posts
    .filter((post) => post.status === 'publish' && typeof post.slug === 'string' && post.slug.trim().length > 0)
    .filter(
      (post) =>
        !excludeArchives ||
        !Array.isArray(post.categories) ||
        post.categories.length === 0 ||
        !post.categories.every((id) => id === archiveCategoryId)
    )
    .map((post) => ({
      url: toAbsoluteUrl(`/articles/${post.slug}`, origin),
      lastModified: parseWpDate(post.modified_gmt),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => page.status === 'publish')
    .flatMap((page) => {
      const path = extractPathnameFromAbsoluteUrl(page.link)
      if (!path) {
        return []
      }

      return [
        {
          path,
          lastModified: parseWpDate(page.modified_gmt)
        }
      ]
    })
    .filter((page) => !['/', '/recherche'].includes(page.path))
    .filter((page) => !page.path.startsWith('/auth/'))
    .map((page) => ({
      url: toAbsoluteUrl(page.path, origin),
      lastModified: page.lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6
    }))

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter(
      (category) =>
        typeof category.slug === 'string' &&
        category.slug.trim().length > 0 &&
        typeof category.count === 'number' &&
        category.count > 0 &&
        !(excludeArchives && archiveSlugs.has(category.slug))
    )
    .map((category) => ({
      url: toAbsoluteUrl(`/categories/${category.slug}`, origin),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))

  return dedupeSitemapEntries([
    ...staticEntries,
    ...pageEntries,
    ...postEntries,
    ...categoryEntries
  ])
}
