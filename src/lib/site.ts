import { fetchWordPressGraphQL } from './wordpress'
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
  const data = await fetchWordPressGraphQL<SiteChromeResponse>(SITE_CHROME_QUERY, {
    next: { revalidate: 300 }
  })

  return {
    settings: data.generalSettings,
    headerMenu: data.headerMenu?.menuItems?.nodes ?? [],
    footerMenu: data.footerMenu?.menuItems?.nodes ?? []
  }
}
