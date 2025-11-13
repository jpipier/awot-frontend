import { fetchWordPressGraphQL, fetchWordPressRest } from './wordpress'
import type { Article, ElementorJsPayload } from '@/types/wordpress'

interface ArticleResponse {
  postBy: Article & {
    optionsArticles?: Article['optionsArticles'] & {
      imagePortait?: {
        node?: {
          guid?: string | null
          srcSet?: string | null
        }
      }
    }
  }
}

const ARTICLE_BY_SLUG_QUERY = /* GraphQL */ `
  query GetPostBySlug($slug: String!) {
    postBy(slug: $slug) {
      databaseId
      title
      content
      elementorContent
      slug
      optionsArticles {
        champsLibre
        champsLibrePageAccueil
        imagePortait {
          node {
            guid
            sourceUrl
            srcSet
            altText
          }
        }
        imagePaysage {
          node {
            guid
            srcSet
          }
        }
      }
      featuredImage {
        node {
          guid
          sourceUrl
          srcSet
          altText
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
`

export async function getArticleBySlug(slug: string) {
  const data = await fetchWordPressGraphQL<ArticleResponse>(ARTICLE_BY_SLUG_QUERY, {
    variables: { slug },
    cache: 'no-store'
  })

  return data.postBy ?? null
}

export async function getElementorCssFiles() {
  return fetchWordPressRest<string[]>("elementor/v1/css-files")
}

export async function getElementorJsAssets(postId?: number | null) {
  const params = new URLSearchParams()

  if (postId) {
    params.set('post_id', String(postId))
  }

  const query = params.toString()
  const path = query ? `elementor/v1/js-files?${query}` : 'elementor/v1/js-files'

  try {
    return await fetchWordPressRest<ElementorJsPayload>(path, { cache: 'no-store' })
  } catch (error) {
    console.warn('Failed to load Elementor JS assets', error)
    return null
  }
}
