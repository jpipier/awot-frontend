import { fetchWordPressGraphQL } from './wordpress'
import type { Article, CategoryNode } from '@/types/wordpress'

interface PostsByCategoryResponse {
  posts: {
    edges: Array<{
      node: Article & {
        id: string
        categories?: {
          edges: Array<{
            node: CategoryNode
          }>
        }
      }
    }>
  }
}

const POSTS_BY_CATEGORY_QUERY = /* GraphQL */ `
  query GetPostsByCategory($categorySlug: String!, $limit: Int!) {
    posts(where: { categoryName: $categorySlug }, first: $limit) {
      edges {
        node {
          id
          title
          excerpt
          slug
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          optionsArticles {
            champsLibre
            champsLibrePageAccueil
            imagePortait {
              node {
                guid
                srcSet
                sourceUrl
                altText
              }
            }
            imagePaysage {
              node {
                guid
                srcSet
                sourceUrl
                altText
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
          categories(first: 40) {
            edges {
              node {
                id
                name
                slug
                count
                children(first: 100) {
                  nodes {
                    id
                    name
                    slug
                    count
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export async function getPostsByCategory(slug: string, limit: number) {
  if (!slug) {
    return []
  }

  const data = await fetchWordPressGraphQL<PostsByCategoryResponse>(POSTS_BY_CATEGORY_QUERY, {
    variables: { categorySlug: slug, limit },
    cache: 'no-store'
  })

  return data.posts?.edges?.map((edge) => edge.node) ?? []
}

interface RecentPostsResponse {
  posts: {
    nodes: Array<{
      id: string
      title: string
      excerpt?: string | null
      slug: string
      featuredImage?: {
        node?: {
          sourceUrl?: string
          guid?: string
          altText?: string
        }
      }
      optionsArticles?: {
        champsLibrePageAccueil?: string | null
        imagePortait?: {
          node?: {
            guid?: string
            sourceUrl?: string
            altText?: string
          }
        }
        imagePaysage?: {
          node?: {
            guid?: string
            sourceUrl?: string
            altText?: string
          }
        }
      }
      localisations?: {
        edges: Array<{
          node: {
            name?: string
            slug?: string
            parent?: {
              node?: {
                name?: string
                slug?: string
              }
            }
          }
        }>
      }
      categories?: {
        edges: Array<{
          node: {
            name?: string
            slug?: string
            parent?: {
              node?: {
                name?: string
                slug?: string
              }
            }
          }
        }>
      }
    }>
  }
}

const RECENT_POSTS_QUERY = /* GraphQL */ `
  query GetRecentPosts($first: Int!) {
    posts(first: $first) {
      nodes {
        id
        title
        excerpt
        slug
        featuredImage {
          node {
            sourceUrl
            guid
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
        }
        localisations {
          edges {
            node {
              name
              slug
              parent {
                node {
                  name
                  slug
                }
              }
            }
          }
        }
        categories {
          edges {
            node {
              name
              slug
              parent {
                node {
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

export async function getRecentPosts(first = 20) {
  const data = await fetchWordPressGraphQL<RecentPostsResponse>(RECENT_POSTS_QUERY, {
    variables: { first },
    cache: 'no-store'
  })

  return data.posts?.nodes ?? []
}
