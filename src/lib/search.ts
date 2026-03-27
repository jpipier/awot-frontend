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

const tokenizeSearchTerm = (term: string) =>
  normalizeSearchValue(term)
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)

const filterSearchPostsByTokens = (posts: SearchPost[], tokens: string[]) => {
  if (!tokens.length) {
    return []
  }

  return posts.filter((post) => {
    const normalizedHaystack = getSearchableHaystacks(post)
      .map((value) => normalizeSearchValue(value))
      .join(' ')

    return tokens.every((token) => normalizedHaystack.includes(token))
  })
}

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
  const tokens = tokenizeSearchTerm(term)
  return filterSearchPostsByTokens(posts, tokens)
}

export async function searchPosts(first = 120) {
  const data = await fetchWordPressGraphQL<SearchResponse>(SEARCH_POSTS_QUERY, {
    variables: { first },
    cache: 'no-store'
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

export async function searchSuggestionPostsByTerm(term: string, first = 120) {
  const trimmedTerm = term.trim()
  if (trimmedTerm.length < 3) {
    return []
  }

  const posts = await searchPosts(first)
  return filterSearchPosts(posts, trimmedTerm)
}
