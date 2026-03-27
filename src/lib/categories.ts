import { fetchWordPressGraphQL, fetchWordPressRest } from './wordpress'
import type { Article, CategoryNode, CategoryPageData } from '@/types/wordpress'

const CATEGORY_REVALIDATE_SECONDS = 300
const CATEGORY_FEED_REVALIDATE_SECONDS = 180

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
    next: { revalidate: CATEGORY_REVALIDATE_SECONDS }
  })

  return data.category ?? null
}

interface CategoryRestNode {
  punchline_category?: string | null
  punchlineCategory?: string | null
  punchlinePageCategorie?: string | null
  acf?: Record<string, unknown> | unknown[] | null
}

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export async function getCategoryPunchlineBySlug(slug: string): Promise<string | null> {
  const graphQlCandidates: Array<{
    query: string
    extract: (data: Record<string, unknown>) => unknown
  }> = [
    {
      query: /* GraphQL */ `
        query GetCategoryPunchlineFromCatGorie($slug: ID!) {
          category(id: $slug, idType: SLUG) {
            catGorie {
              punchlinePageCategorie
            }
          }
        }
      `,
      extract: (data) =>
        ((data.category as { catGorie?: { punchlinePageCategorie?: string | null } | null } | undefined)?.catGorie
          ?.punchlinePageCategorie ?? null)
    },
    {
      query: /* GraphQL */ `
        query GetCategoryPunchlineDirect($slug: ID!) {
          category(id: $slug, idType: SLUG) {
            punchlinePageCategorie
          }
        }
      `,
      extract: (data) =>
        ((data.category as { punchlinePageCategorie?: string | null } | undefined)?.punchlinePageCategorie ?? null)
    }
  ]

  for (const candidate of graphQlCandidates) {
    try {
      const data = await fetchWordPressGraphQL<Record<string, unknown>>(candidate.query, {
        variables: { slug },
        next: { revalidate: CATEGORY_REVALIDATE_SECONDS }
      })
      const value = asNonEmptyString(candidate.extract(data))
      if (value) {
        return value
      }
    } catch {
      // Fallback to the next candidate / REST strategy.
    }
  }

  try {
    const categories = await fetchWordPressRest<CategoryRestNode[]>(
      `wp/v2/categories?slug=${encodeURIComponent(slug)}&per_page=1`,
      { cache: 'force-cache' }
    )

    const category = categories?.[0]
    if (!category) {
      return null
    }

    const directSnake = asNonEmptyString(category.punchline_category)
    if (directSnake) {
      return directSnake
    }

    const directCamel = asNonEmptyString(category.punchlineCategory)
    if (directCamel) {
      return directCamel
    }

    const directFrench = asNonEmptyString(category.punchlinePageCategorie)
    if (directFrench) {
      return directFrench
    }

    const acf = category.acf
    if (acf && typeof acf === 'object' && !Array.isArray(acf)) {
      const acfSnake = asNonEmptyString((acf as Record<string, unknown>).punchline_category)
      if (acfSnake) {
        return acfSnake
      }

      const acfCamel = asNonEmptyString((acf as Record<string, unknown>).punchlineCategory)
      if (acfCamel) {
        return acfCamel
      }

      const acfFrench = asNonEmptyString((acf as Record<string, unknown>).punchlinePageCategorie)
      if (acfFrench) {
        return acfFrench
      }
    }

    return null
  } catch (error) {
    console.warn(`Unable to load category punchline for "${slug}"`, error)
    return null
  }
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
    next: { revalidate: CATEGORY_FEED_REVALIDATE_SECONDS }
  })

  return data.category?.posts
}

interface PostsByFiltersResponse {
  posts: {
    nodes: Article[]
    pageInfo: {
      hasNextPage: boolean
      endCursor?: string | null
    }
  }
}

const CATEGORY_LOCALISATION_POSTS_QUERY = /* GraphQL */ `
  query GetCategoryLocalisationPosts($limit: Int!, $after: String, $categorySlug: String!, $localisationSlug: [String!]!) {
    posts(
      first: $limit
      after: $after
      where: {
        categoryName: $categorySlug
        taxQuery: {
          taxArray: [
            { taxonomy: LOCALISATION, field: SLUG, terms: $localisationSlug }
          ]
        }
      }
    ) {
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
`

export async function getCategoryPostsByLocalisation(
  categorySlug: string,
  localisationSlug: string,
  limit: number,
  after?: string | null
) {
  const data = await fetchWordPressGraphQL<PostsByFiltersResponse>(CATEGORY_LOCALISATION_POSTS_QUERY, {
    variables: {
      categorySlug,
      localisationSlug: [localisationSlug],
      limit,
      after: after ?? null
    },
    next: { revalidate: CATEGORY_FEED_REVALIDATE_SECONDS }
  })

  return data.posts ?? { nodes: [], pageInfo: { hasNextPage: false } }
}

interface LocalisationsResponse {
  localisations: {
    nodes: CategoryNode[]
  }
}

const LOCALISATIONS_QUERY = /* GraphQL */ `
  query GetLocalisations($first: Int!) {
    localisations(first: $first, where: { hideEmpty: true, parent: 0 }) {
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`

export async function getLocalisations(first = 100) {
  const data = await fetchWordPressGraphQL<LocalisationsResponse>(LOCALISATIONS_QUERY, {
    variables: { first },
    next: { revalidate: 600 }
  })

  return data.localisations?.nodes ?? []
}
