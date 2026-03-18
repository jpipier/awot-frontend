import { fetchWordPressGraphQL } from './wordpress'
import type { Article } from '@/types/wordpress'

interface SearchKeywordConnection {
  edges: Array<{
    node: {
      name: string
    }
  }>
}

export interface SearchPost extends Article {
  id: string
  slug: string
  optionsArticles?: Article['optionsArticles'] & {
    keywordSearch?: SearchKeywordConnection
  }
}

interface SearchResponse {
  posts: {
    nodes: SearchPost[]
  }
}

const SEARCH_POSTS_QUERY = /* GraphQL */ `
  query SearchPosts($first: Int!) {
    posts(first: $first) {
      nodes {
        id
        title
        slug
        excerpt
        featuredImage {
          node {
            guid
            sourceUrl
            altText
          }
        }
        optionsArticles {
          champsLibrePageAccueil
          imagePortait {
            node {
              guid
              sourceUrl
              altText
            }
          }
          imagePaysage {
            node {
              guid
              sourceUrl
              altText
            }
          }
          keywordSearch {
            edges {
              node {
                name
              }
            }
          }
        }
        localisations {
          edges {
            node {
              id
              name
              slug
              parent {
                node {
                  id
                  name
                  slug
                }
              }
            }
          }
        }
        categories(first: 20) {
          edges {
            node {
              id
              name
              slug
              parent {
                node {
                  id
                  name
                  slug
                }
              }
            }
          }
        }
      }
    }
  }
`

const normalizeSearchValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const getSearchableHaystacks = (post: SearchPost) => {
  const keywords = post.optionsArticles?.keywordSearch?.edges?.map((edge) => edge.node.name ?? '') ?? []
  const localisations = post.localisations?.edges?.map((edge) => edge.node?.name ?? '') ?? []
  const categories = post.categories?.edges?.map((edge) => edge.node?.name ?? '') ?? []

  return [
    post.title ?? '',
    post.optionsArticles?.champsLibrePageAccueil ?? '',
    ...keywords,
    ...localisations,
    ...categories
  ]
}

export function filterSearchPosts(posts: SearchPost[], term: string) {
  const needle = normalizeSearchValue(term)
  if (!needle) {
    return []
  }

  return posts.filter((post) =>
    getSearchableHaystacks(post).some((value) => normalizeSearchValue(value).includes(needle))
  )
}

export async function searchPosts(first = 120) {
  const data = await fetchWordPressGraphQL<SearchResponse>(SEARCH_POSTS_QUERY, {
    variables: { first },
    next: { revalidate: 120 }
  })

  return data.posts?.nodes ?? []
}

export async function searchPostsByTerm(term: string, first = 120) {
  const trimmedTerm = term.trim()
  if (trimmedTerm.length < 3) {
    return []
  }

  const posts = await searchPosts(first)
  return filterSearchPosts(posts, trimmedTerm)
}
