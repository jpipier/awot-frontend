import { fetchWordPressGraphQL } from './wordpress'

interface PageResponse {
  page: {
    databaseId: number
    title: string
    uri: string
    isFrontPage: boolean
    elementorContent?: string | null
    content?: string | null
  } | null
}

const PAGE_BY_URI_QUERY = /* GraphQL */ `
  query GetPageByUri($uri: ID!) {
    page(id: $uri, idType: URI) {
      databaseId
      title
      uri
      isFrontPage
      elementorContent
      content
    }
  }
`

export async function getPageByUri(uri: string) {
  const data = await fetchWordPressGraphQL<PageResponse>(PAGE_BY_URI_QUERY, {
    variables: { uri },
    cache: 'no-store'
  })

  return data.page
}
