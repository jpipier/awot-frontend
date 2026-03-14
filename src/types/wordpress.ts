export interface MenuItem {
  id: string
  label: string
  path: string
}

export interface SiteSettings {
  title: string
  description: string
}

export interface WPImage {
  guid?: string | null
  sourceUrl?: string | null
  srcSet?: string | null
  sizes?: string | null
  altText?: string | null
  mediaDetails?: {
    width?: number | null
    height?: number | null
  }
}

export interface CategoryNode {
  id?: string
  name?: string
  slug: string
  count?: number
  children?: {
    nodes: CategoryNode[]
  }
  parent?: {
    node?: CategoryNode | null
  }
}

export interface HomePageData {
  template?: {
    homepage?: {
      blocs: HomePageBloc[]
    }
  }
}

type KnownHomeBlocNames =
  | 'HomepageBlocsImageLayout'
  | 'HomepageBlocsContenuLayout'
  | 'HomepageBlocsGuideVoyageLayout'
  | 'HomepageBlocsCarouselLayout'
  | 'HomepageBlocsGuideLayout'
  | 'HomepageBlocsSliderLayout'
  | 'HomepageBlocsPortraitLayout'
  | 'HomepageBlocsWorkWithUsLayout'

export type HomePageBloc =
  | {
      fieldGroupName: 'HomepageBlocsImageLayout'
      image?: {
        node?: WPImage
      }
    }
  | {
      fieldGroupName: 'HomepageBlocsContenuLayout'
      contenu?: string | null
    }
  | {
      fieldGroupName: 'HomepageBlocsGuideVoyageLayout'
      postParPage?: number | null
      titreDeLaSection?: string | null
      categorie?: {
        nodes: { slug: string }[]
      }
      lien?: {
        target?: string | null
        title?: string | null
        url?: string | null
      }
    }
  | {
      fieldGroupName: 'HomepageBlocsCarouselLayout'
      postParPage?: number | null
      headline?: string | null
      contenu?: string | null
      titreDeLaSection?: string | null
      lien?: {
        target?: string | null
        title?: string | null
        url?: string | null
      }
      categorie?: {
        nodes: { slug: string }[]
      }
    }
  | {
      fieldGroupName: 'HomepageBlocsGuideLayout'
      categorie?: {
        nodes: { slug: string }[]
      }
      lien?: {
        target?: string | null
        title?: string | null
        url?: string | null
      }
    }
  | {
      fieldGroupName: 'HomepageBlocsSliderLayout'
      slider?: Array<{
        img?: {
          node?: {
            guid?: string | null
            link?: string | null
            slug?: string | null
          }
        }
        slug?: {
          url?: string | null
          title?: string | null
        }
        sousTitre?: string | null
        titre?: string | null
        headline?: string | null
        afficherDuTexte?: boolean | null
      }>
    }
  | {
      fieldGroupName: 'HomepageBlocsPortraitLayout'
      postParPage?: number | null
      headline?: string | null
      contenu?: string | null
      titreDeLaSection?: string | null
      lien?: {
        target?: string | null
        title?: string | null
        url?: string | null
      }
      categorie?: {
        nodes: { slug: string }[]
      }
    }
  | {
      fieldGroupName: 'HomepageBlocsWorkWithUsLayout'
      image?: {
        node?: WPImage
      }
      titre?: string | null
      contenu?: string | null
      bouton?: {
        target?: string | null
        title?: string | null
        url?: string | null
      }
    }
  | ({ fieldGroupName: Exclude<string, KnownHomeBlocNames> } & Record<string, unknown>)

export interface Article {
  databaseId?: number
  title: string
  uri?: string | null
  content?: string | null
  elementorContent?: string | null
  isBuiltWithElementor?: boolean | null
  localisations?: {
    edges: Array<{
      node: CategoryNode
    }>
  }
  optionsArticles?: {
    champsLibre?: string | null
    champsLibrePageAccueil?: string | null
    imagePortait?: {
      node?: WPImage
    }
    imagePaysage?: {
      node?: WPImage
    }
  }
  featuredImage?: {
    node?: WPImage
  }
  excerpt?: string | null
  slug?: string
  categories?: {
    edges: Array<{
      node: CategoryNode
    }>
  }
}

export interface CategoryPageData {
  category?: {
    name?: string
    slug?: string
    parent?: {
      node?: CategoryNode
    }
    children?: {
      nodes: CategoryNode[]
    }
    posts?: {
      nodes: Article[]
      pageInfo?: {
        hasNextPage: boolean
        endCursor?: string | null
      }
    }
  }
}

export interface ElementorScriptAsset {
  handle: string
  src: string
  dependencies?: string[]
  inFooter?: boolean
  strategy?: 'async' | 'defer' | null
  type?: string | null
}

export interface ElementorInlineScript {
  id: string
  target?: string | null
  position?: 'before' | 'after'
  code: string
}

export interface ElementorJsPayload {
  scripts: ElementorScriptAsset[]
  inline: ElementorInlineScript[]
}
