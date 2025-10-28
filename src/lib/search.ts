import { fetchWordPressGraphQL } from './wordpress'

interface SearchResponse {
  posts: {
    nodes: Array<{
      id: string
      title: string
      slug: string
      optionsArticles?: {
        keywordSearch?: {
          edges: Array<{
            node: {
              name: string
            }
          }>
        }
      }
    }>
  }
}

const SEARCH_POSTS_QUERY = /* GraphQL */ `
  query SearchPosts($first: Int!) {
    posts(first: $first) {
      nodes {
        id
        title
        slug
        optionsArticles {
          keywordSearch {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    }
  }
`

export async function searchPosts(first = 30) {
  const data = await fetchWordPressGraphQL<SearchResponse>(SEARCH_POSTS_QUERY, {
    variables: { first },
    next: { revalidate: 120 }
  })

  return data.posts?.nodes ?? []
}
