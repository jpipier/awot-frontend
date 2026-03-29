import { fetchWordPressGraphQL } from './wordpress'

const PAGE_REVALIDATE_SECONDS = 600

interface PageResponse {
  page: {
    databaseId: number
    title: string
    slug?: string | null
    link?: string | null
    uri: string
    isFrontPage: boolean
    elementorContent?: string | null
    isBuiltWithElementor?: boolean | null
    content?: string | null
  } | null
}

const PAGE_BY_URI_QUERY = /* GraphQL */ `
  query GetPageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      databaseId
      title
      slug
      link
      uri
      isFrontPage
      elementorContent
      isBuiltWithElementor
      content
    }
  }
`

export async function getPageByUri(uri: string) {
  const data = await fetchWordPressGraphQL<PageResponse>(PAGE_BY_URI_QUERY, {
    variables: { uri },
    next: { revalidate: PAGE_REVALIDATE_SECONDS }
  })

  return data.page
}
