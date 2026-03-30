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

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  title: 'A Way of Travel',
  description: 'Guide Landes & Pays Basque - A Way of Travel'
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
    }).catch((error) => {
      console.error('Failed to load site chrome GraphQL data', error)
      return null
    }),
    fetchWordPressRest<WordPressRestIndexResponse>('', {
      next: { revalidate: 300 }
    }).catch((error) => {
      console.warn('Failed to load WordPress REST index for favicon', error)
      return null
    })
  ])

  const faviconUrl = restIndex?.site_icon_url ?? null

  return {
    settings: data?.generalSettings ?? DEFAULT_SITE_SETTINGS,
    headerMenu: data?.headerMenu?.menuItems?.nodes ?? [],
    footerMenu: data?.footerMenu?.menuItems?.nodes ?? [],
    faviconUrl
  }
}
