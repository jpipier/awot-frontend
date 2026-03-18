import type { Article } from '@/types/wordpress'

export const getFirstNonEmptyString = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value !== 'string') {
      continue
    }

    const trimmed = value.trim()
    if (trimmed) {
      return trimmed
    }
  }

  return ''
}

export const getArticlePortraitImage = (post: Article) =>
  getFirstNonEmptyString(
    post.optionsArticles?.imagePortait?.node?.sourceUrl,
    post.optionsArticles?.imagePortait?.node?.guid,
    post.featuredImage?.node?.sourceUrl,
    post.featuredImage?.node?.guid,
    post.optionsArticles?.imagePaysage?.node?.sourceUrl,
    post.optionsArticles?.imagePaysage?.node?.guid
  )

export const getArticleLandscapeImage = (post: Article) =>
  getFirstNonEmptyString(
    post.optionsArticles?.imagePaysage?.node?.sourceUrl,
    post.optionsArticles?.imagePaysage?.node?.guid,
    post.featuredImage?.node?.sourceUrl,
    post.featuredImage?.node?.guid,
    post.optionsArticles?.imagePortait?.node?.sourceUrl,
    post.optionsArticles?.imagePortait?.node?.guid
  )

export const getArticleAlt = (post: Article) =>
  getFirstNonEmptyString(
    post.optionsArticles?.imagePaysage?.node?.altText,
    post.optionsArticles?.imagePortait?.node?.altText,
    post.featuredImage?.node?.altText,
    post.title
  )

export const getArticleLocationLabel = (post: Article) => {
  const localisationNames =
    post.localisations?.edges
      ?.map((edge) => edge.node?.name?.trim() ?? '')
      .filter((name) => name.length > 0) ?? []

  if (localisationNames.length > 0) {
    return localisationNames.join(', ')
  }

  return getFirstNonEmptyString(
    post.optionsArticles?.champsLibrePageAccueil,
    post.categories?.edges?.[0]?.node?.name
  )
}
