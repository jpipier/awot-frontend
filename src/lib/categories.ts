import { fetchWordPressGraphQL, fetchWordPressRest } from './wordpress'
import type { Article, CategoryNode, CategoryPageData, FiltreNode } from '@/types/wordpress'

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
      uri
      link
      description
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
  try {
    const data = await fetchWordPressGraphQL<CategoryPageResponse>(CATEGORY_PAGE_QUERY, {
      variables: { slug, limit },
      next: { revalidate: CATEGORY_REVALIDATE_SECONDS }
    })

    return data.category ?? null
  } catch (error) {
    console.warn(`Failed to load category page "${slug}"`, error)
    return null
  }
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

const CATEGORY_FILTRE_POSTS_QUERY = /* GraphQL */ `
  query GetCategoryFiltrePosts($limit: Int!, $after: String, $categorySlug: String!, $filtreSlug: [String!]!) {
    posts(
      first: $limit
      after: $after
      where: {
        categoryName: $categorySlug
        taxQuery: {
          taxArray: [
            { taxonomy: FILTRE, field: SLUG, terms: $filtreSlug, operator: AND }
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

const CATEGORY_LOCALISATION_FILTRE_POSTS_QUERY = /* GraphQL */ `
  query GetCategoryLocalisationFiltrePosts(
    $limit: Int!
    $after: String
    $categorySlug: String!
    $localisationSlug: [String!]!
    $filtreSlug: [String!]!
  ) {
    posts(
      first: $limit
      after: $after
      where: {
        categoryName: $categorySlug
        taxQuery: {
          relation: AND
          taxArray: [
            { taxonomy: LOCALISATION, field: SLUG, terms: $localisationSlug }
            { taxonomy: FILTRE, field: SLUG, terms: $filtreSlug, operator: AND }
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

function normalizeTermSlugs(termSlugs: string | string[]) {
  const values = Array.isArray(termSlugs) ? termSlugs : [termSlugs]

  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    )
  )
}

export async function getCategoryPostsByFiltre(
  categorySlug: string,
  filtreSlug: string | string[],
  limit: number,
  after?: string | null
) {
  const filtreSlugs = normalizeTermSlugs(filtreSlug)
  if (!filtreSlugs.length) {
    return { nodes: [], pageInfo: { hasNextPage: false } }
  }

  const data = await fetchWordPressGraphQL<PostsByFiltersResponse>(CATEGORY_FILTRE_POSTS_QUERY, {
    variables: {
      categorySlug,
      filtreSlug: filtreSlugs,
      limit,
      after: after ?? null
    },
    next: { revalidate: CATEGORY_FEED_REVALIDATE_SECONDS }
  })

  return data.posts ?? { nodes: [], pageInfo: { hasNextPage: false } }
}

export async function getCategoryPostsByLocalisationAndFiltre(
  categorySlug: string,
  localisationSlug: string,
  filtreSlug: string | string[],
  limit: number,
  after?: string | null
) {
  const filtreSlugs = normalizeTermSlugs(filtreSlug)
  if (!filtreSlugs.length) {
    return { nodes: [], pageInfo: { hasNextPage: false } }
  }

  const data = await fetchWordPressGraphQL<PostsByFiltersResponse>(CATEGORY_LOCALISATION_FILTRE_POSTS_QUERY, {
    variables: {
      categorySlug,
      localisationSlug: [localisationSlug],
      filtreSlug: filtreSlugs,
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

interface FiltresResponse {
  filtres?: {
    nodes?: Array<{
      id?: string
      name?: string | null
      slug?: string | null
      count?: number | null
      posts?: {
        nodes?: Array<{
          slug?: string | null
        }>
      } | null
      filtreChamps?: {
        picto?: {
          node?: {
            sourceUrl?: string | null
            mediaItemUrl?: string | null
            altText?: string | null
            mimeType?: string | null
          } | null
        } | null
        pictoHover?: {
          node?: {
            sourceUrl?: string | null
            mediaItemUrl?: string | null
            altText?: string | null
            mimeType?: string | null
          } | null
        } | null
        picto_hover?: {
          node?: {
            sourceUrl?: string | null
            mediaItemUrl?: string | null
            altText?: string | null
            mimeType?: string | null
          } | null
        } | null
      } | null
    }>
  }
}

type FiltreHoverFieldName = 'pictoHover' | 'picto_hover'

function buildFiltresQuery(withCategory: boolean, hoverFieldName?: FiltreHoverFieldName) {
  const variableDeclaration = withCategory ? '$first: Int!, $categorySlug: String!' : '$first: Int!'
  const postsSelection = withCategory
    ? `
        posts(first: 1, where: { categoryName: $categorySlug }) {
          nodes {
            slug
          }
        }
      `
    : ''
  const hoverSelection = hoverFieldName
    ? `
          ${hoverFieldName} {
            node {
              sourceUrl
              mediaItemUrl
              altText
              mimeType
            }
          }
      `
    : ''

  return /* GraphQL */ `
    query GetFiltres(${variableDeclaration}) {
      filtres(first: $first, where: { hideEmpty: false }) {
        nodes {
          id
          name
          slug
          count
          ${postsSelection}
          filtreChamps {
            picto {
              node {
                sourceUrl
                mediaItemUrl
                altText
                mimeType
              }
            }
            ${hoverSelection}
          }
        }
      }
    }
  `
}

const FILTRES_QUERY = buildFiltresQuery(false)
const FILTRES_QUERY_WITH_HOVER_CAMEL = buildFiltresQuery(false, 'pictoHover')
const FILTRES_QUERY_WITH_HOVER_SNAKE = buildFiltresQuery(false, 'picto_hover')
const FILTRES_BY_CATEGORY_QUERY = buildFiltresQuery(true)
const FILTRES_BY_CATEGORY_QUERY_WITH_HOVER_CAMEL = buildFiltresQuery(true, 'pictoHover')
const FILTRES_BY_CATEGORY_QUERY_WITH_HOVER_SNAKE = buildFiltresQuery(true, 'picto_hover')

export async function getLocalisations(first = 100) {
  try {
    const data = await fetchWordPressGraphQL<LocalisationsResponse>(LOCALISATIONS_QUERY, {
      variables: { first },
      next: { revalidate: 600 }
    })

    return data.localisations?.nodes ?? []
  } catch (error) {
    console.warn('Failed to load localisations', error)
    return []
  }
}

export async function getFiltres(categorySlug?: string | null, first = 100): Promise<FiltreNode[]> {
  try {
    const normalizedCategorySlug = asNonEmptyString(categorySlug)
    const variables = normalizedCategorySlug ? { first, categorySlug: normalizedCategorySlug } : { first }
    const queryCandidates = normalizedCategorySlug
      ? [
          FILTRES_BY_CATEGORY_QUERY_WITH_HOVER_CAMEL,
          FILTRES_BY_CATEGORY_QUERY_WITH_HOVER_SNAKE,
          FILTRES_BY_CATEGORY_QUERY
        ]
      : [FILTRES_QUERY_WITH_HOVER_CAMEL, FILTRES_QUERY_WITH_HOVER_SNAKE, FILTRES_QUERY]

    let data: FiltresResponse | null = null
    let lastError: unknown = null

    for (const query of queryCandidates) {
      try {
        data = await fetchWordPressGraphQL<FiltresResponse>(query, {
          variables,
          next: { revalidate: 600 }
        })
        break
      } catch (error) {
        lastError = error
      }
    }

    if (!data) {
      throw lastError ?? new Error('Unable to load filtres')
    }

    const rawNodes = data.filtres?.nodes ?? []

    return rawNodes
      .map<FiltreNode | null>((node) => {
        const slug = asNonEmptyString(node.slug)
        if (!slug) {
          return null
        }

        if (normalizedCategorySlug) {
          const relatedPostCount = node.posts?.nodes?.length ?? 0
          if (relatedPostCount === 0) {
            return null
          }
        }

        const pictoNode = node.filtreChamps?.picto?.node
        const pictoHoverNode = node.filtreChamps?.pictoHover?.node ?? node.filtreChamps?.picto_hover?.node
        const pictoUrl = asNonEmptyString(pictoNode?.sourceUrl) ?? asNonEmptyString(pictoNode?.mediaItemUrl)
        const pictoAlt = asNonEmptyString(pictoNode?.altText) ?? asNonEmptyString(node.name)
        const pictoHoverUrl =
          asNonEmptyString(pictoHoverNode?.sourceUrl) ?? asNonEmptyString(pictoHoverNode?.mediaItemUrl)
        const pictoHoverAlt = asNonEmptyString(pictoHoverNode?.altText) ?? asNonEmptyString(node.name)

        if (!pictoUrl) {
          return null
        }

        return {
          id: asNonEmptyString(node.id) ?? undefined,
          slug,
          name: asNonEmptyString(node.name) ?? '',
          count: typeof node.count === 'number' ? node.count : undefined,
          pictoUrl,
          pictoAlt,
          pictoHoverUrl,
          pictoHoverAlt
        }
      })
      .filter((node): node is FiltreNode => Boolean(node))
  } catch (error) {
    console.warn('Unable to load filtres', error)
    return []
  }
}
