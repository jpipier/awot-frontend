import { fetchWordPressGraphQL, fetchWordPressRest } from './wordpress'
import type { MenuItem, SiteSettings } from '@/types/wordpress'

interface SiteChromeResponse {
  generalSettings: SiteSettings
  headerMenu: {
    menuItems?: {
      nodes?: MenuItem[]
    }
  }
  footerMenu: {
    menuItems?: {
      nodes?: MenuItem[]
    }
  }
}

interface WordPressRestIndexResponse {
  site_icon_url?: string | null
}

const SITE_CHROME_QUERY = /* GraphQL */ `
  query GetSiteChrome {
    generalSettings {
      title
      description
    }
    headerMenu: menu(id: "Responsive", idType: SLUG) {
      menuItems(first: 100) {
        nodes {
          id
          label
          path
        }
      }
    }
    footerMenu: menu(id: "footer", idType: SLUG) {
      menuItems(first: 100) {
        nodes {
          id
          label
          path
        }
      }
    }
  }
`

export async function getSiteChrome() {
  const [data, restIndex] = await Promise.all([
    fetchWordPressGraphQL<SiteChromeResponse>(SITE_CHROME_QUERY, {
      next: { revalidate: 300 }
    }),
    fetchWordPressRest<WordPressRestIndexResponse>('', {
      next: { revalidate: 300 }
    }).catch(() => null)
  ])

  const faviconUrl = restIndex?.site_icon_url ?? null

  return {
    settings: data.generalSettings,
    headerMenu: data.headerMenu?.menuItems?.nodes ?? [],
    footerMenu: data.footerMenu?.menuItems?.nodes ?? [],
    faviconUrl
  }
}
