import { fetchWordPressGraphQL, fetchWordPressRest } from './wordpress'
import type { MenuItem, SiteSettings } from '@/types/wordpress'
import he from 'he'
import { SITE_DESCRIPTION, SITE_NAME } from './site-config'

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
  title: SITE_NAME,
  description: SITE_DESCRIPTION
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
  const settings = data?.generalSettings ?? DEFAULT_SITE_SETTINGS

  return {
    settings: {
      ...settings,
      title: he.decode(settings.title),
      description: he.decode(settings.description)
    },
    headerMenu: data?.headerMenu?.menuItems?.nodes ?? [],
    footerMenu: data?.footerMenu?.menuItems?.nodes ?? [],
    faviconUrl
  }
}
