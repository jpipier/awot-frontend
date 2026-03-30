import { fetchWordPressGraphQL } from './wordpress'

const PAGE_REVALIDATE_SECONDS = 600

interface PageBase {
  databaseId: number
  title: string
  slug?: string | null
  link?: string | null
  uri: string
  isFrontPage: boolean
  content?: string | null
}

interface PageWithElementor extends PageBase {
  elementorContent?: string | null
  isBuiltWithElementor?: boolean | null
}

interface PageResponseWithElementor {
  page: PageWithElementor | null
}

interface PageResponseBase {
  page: PageBase | null
}

const PAGE_BASE_FIELDS = /* GraphQL */ `
  databaseId
  title
  slug
  link
  uri
  isFrontPage
  content
`

const PAGE_BY_URI_QUERY_WITH_ELEMENTOR = /* GraphQL */ `
  query GetPageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      ${PAGE_BASE_FIELDS}
      elementorContent
      isBuiltWithElementor
    }
  }
`

const PAGE_BY_URI_QUERY_BASE = /* GraphQL */ `
  query GetPageByUriWithoutElementor($uri: ID!) {
    page(id: $uri, idType: URI) {
      ${PAGE_BASE_FIELDS}
    }
  }
`

let pageSupportsElementorFields: boolean | null = null

function isMissingPageElementorFieldError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  return /Cannot query field "(elementorContent|isBuiltWithElementor)" on type "Page"/.test(error.message)
}

function withFallbackElementorFields(page: PageBase | null): PageWithElementor | null {
  if (!page) {
    return null
  }

  return {
    ...page,
    elementorContent: null,
    isBuiltWithElementor: null
  }
}

export async function getPageByUri(uri: string) {
  const options = {
    variables: { uri },
    next: { revalidate: PAGE_REVALIDATE_SECONDS }
  } as const

  if (pageSupportsElementorFields === false) {
    try {
      const fallbackData = await fetchWordPressGraphQL<PageResponseBase>(PAGE_BY_URI_QUERY_BASE, options)
      return withFallbackElementorFields(fallbackData.page)
    } catch (error) {
      console.warn(`Failed to load page by uri "${uri}" without Elementor fields`, error)
      return null
    }
  }

  try {
    const data = await fetchWordPressGraphQL<PageResponseWithElementor>(PAGE_BY_URI_QUERY_WITH_ELEMENTOR, options)
    pageSupportsElementorFields = true
    return data.page
  } catch (error) {
    if (!isMissingPageElementorFieldError(error)) {
      console.warn(`Failed to load page by uri "${uri}"`, error)
      return null
    }

    pageSupportsElementorFields = false
    try {
      const fallbackData = await fetchWordPressGraphQL<PageResponseBase>(PAGE_BY_URI_QUERY_BASE, options)
      return withFallbackElementorFields(fallbackData.page)
    } catch (fallbackError) {
      console.warn(`Failed to load page by uri "${uri}" on Elementor fallback`, fallbackError)
      return null
    }
  }
}
