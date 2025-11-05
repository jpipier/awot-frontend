import { fetchWordPressGraphQL } from './wordpress'
import type { Article, CategoryNode, CategoryPageData } from '@/types/wordpress'

interface CategoryPageResponse {
  category: CategoryPageData['category']
}

const CATEGORY_PAGE_QUERY = /* GraphQL */ `
  query GetCategory($slug: ID!, $limit: Int!) {
    category(id: $slug, idType: SLUG) {
      name
      slug
      parent {
        node {
          id
          slug
          name
          children(first: 100) {
            nodes {
              name
              slug
              count
            }
          }
        }
      }
      children(first: 100) {
        nodes {
          name
          slug
          count
        }
      }
      posts(first: $limit) {
        nodes {
          title
          slug
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          optionsArticles {
            champsLibrePageAccueil
            imagePortait {
              node {
                sourceUrl
                altText
              }
            }
            imagePaysage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

export async function getCategoryPage(slug: string, limit: number) {
  const data = await fetchWordPressGraphQL<CategoryPageResponse>(CATEGORY_PAGE_QUERY, {
    variables: { slug, limit },
    cache: 'no-store'
  })

  return data.category ?? null
}

interface CategoryChildrenResponse {
  category: {
    name: string
    slug: string
    children?: {
      nodes: CategoryNode[]
    }
  } | null
}

const CATEGORY_CHILDREN_QUERY = /* GraphQL */ `
  query GetCategoryChildren($slug: ID!, $first: Int!) {
    category(id: $slug, idType: SLUG) {
      name
      slug
      children(first: $first, where: { hideEmpty: true }) {
        nodes {
          id
          name
          slug
          count
        }
      }
    }
  }
`

export async function getCategoryChildrenBySlug(slug: string, first = 100) {
  const data = await fetchWordPressGraphQL<CategoryChildrenResponse>(CATEGORY_CHILDREN_QUERY, {
    variables: { slug, first },
    next: { revalidate: 600 }
  })

  return data.category
}

interface CategoryPostsResponse {
  category: {
    posts: {
      nodes: Article[]
      pageInfo: {
        hasNextPage: boolean
        endCursor?: string | null
      }
    }
  }
}

const CATEGORY_POSTS_QUERY = /* GraphQL */ `
  query GetCategoryPosts($slug: ID!, $limit: Int!, $after: String) {
    category(id: $slug, idType: SLUG) {
      posts(first: $limit, after: $after) {
        nodes {
          title
          slug
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          optionsArticles {
            champsLibrePageAccueil
            imagePortait {
              node {
                sourceUrl
                altText
              }
            }
            imagePaysage {
              node {
                sourceUrl
                altText
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

export async function getCategoryPosts(slug: string, limit: number, after?: string | null) {
  const data = await fetchWordPressGraphQL<CategoryPostsResponse>(CATEGORY_POSTS_QUERY, {
    variables: { slug, limit, after: after ?? null },
    cache: 'no-store'
  })

  return data.category?.posts
}
