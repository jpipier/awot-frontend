import { fetchWordPressGraphQL, fetchWordPressRest } from './wordpress'
import type { Article } from '@/types/wordpress'

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
            srcSet
          }
        }
        imagePaysage {
          node {
            guid
            srcSet
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
