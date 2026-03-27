import { fetchWordPressGraphQL } from './wordpress'
import type { HomePageData } from '@/types/wordpress'

const HOME_REVALIDATE_SECONDS = 600

interface HomePageIdResponse {
  allSettings: {
    readingSettingsPageOnFront: number
  }
}

interface HomePageResponse {
  page: HomePageData
}

const HOME_ID_QUERY = /* GraphQL */ `
  query GetSiteSettings {
    allSettings {
      readingSettingsPageOnFront
    }
  }
`

const HOME_PAGE_QUERY = /* GraphQL */ `
  query GetHomePage($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      template {
        ... on Template_HomePage {
          homepage {
            blocs {
              fieldGroupName
              ... on HomepageBlocsVideoLayout {
                fieldGroupName
                plateforme
                video
              }
              ... on HomepageBlocsSliderLayout {
                fieldGroupName
                slider {
                  img {
                    node {
                      guid
                      link
                      slug
                    }
                  }
                  slug {
                    url
                    title
                  }
                  sousTitre
                  titre
                  headline
                  afficherDuTexte
                }
              }
              ... on HomepageBlocsImageLayout {
                fieldGroupName
                image {
                  node {
                    sourceUrl(size: CAROUSEL_SIZE)
                    uri
                    srcSet(size: CAROUSEL_SIZE)
                    sizes(size: CAROUSEL_SIZE)
                    guid
                  }
                }
              }
              ... on HomepageBlocsContenuLayout {
                contenu
                fieldGroupName
              }
              ... on HomepageBlocsCarouselLayout {
                fieldGroupName
                postParPage
                headline
                contenu
                titreDeLaSection
                lien {
                  target
                  title
                  url
                }
                categorie {
                  nodes {
                    slug
                  }
                }
              }
              ... on HomepageBlocsPortraitLayout {
                fieldGroupName
                postParPage
                headline
                contenu
                titreDeLaSection
                lien {
                  target
                  title
                  url
                }
                categorie {
                  nodes {
                    slug
                  }
                }
              }
              ... on HomepageBlocsWorkWithUsLayout {
                fieldGroupName
                titre
                contenu
                bouton {
                  target
                  title
                  url
                }
                image {
                  node {
                    sourceUrl(size: CAROUSEL_SIZE)
                    uri
                    srcSet(size: CAROUSEL_SIZE)
                    sizes(size: CAROUSEL_SIZE)
                    guid
                    altText
                    mediaDetails {
                      width
                      height
                    }
                  }
                }
              }
              ... on HomepageBlocsGuideLayout {
                fieldGroupName
                categorie {
                  nodes {
                    slug
                  }
                }
                lien {
                  target
                  title
                  url
                }
              }
              ... on HomepageBlocsGuideVoyageLayout {
                fieldGroupName
                postParPage
                titreDeLaSection
                lien {
                  target
                  title
                  url
                }
                categorie {
                  nodes {
                    slug
                  }
                }
              }
              ... on HomepageBlocsShopLayout {
                fieldGroupName
                sousTitre
                titreDeLaSection
              }
            }
          }
        }
      }
    }
  }
`

export async function getHomePage(): Promise<HomePageData | null> {
  const { allSettings } = await fetchWordPressGraphQL<HomePageIdResponse>(HOME_ID_QUERY, {
    next: { revalidate: HOME_REVALIDATE_SECONDS }
  })

  const pageId = allSettings?.readingSettingsPageOnFront

  if (!pageId) {
    return null
  }

  const { page } = await fetchWordPressGraphQL<HomePageResponse>(HOME_PAGE_QUERY, {
    variables: { id: pageId },
    next: { revalidate: HOME_REVALIDATE_SECONDS }
  })

  return page ?? null
}
