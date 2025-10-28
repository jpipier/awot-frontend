import SliderLayoutClient from './SliderLayoutClient'
import { getSiteChrome } from '@/lib/site'

interface SliderLayoutProps {
  slider?: Array<{
    img?: {
      node?: {
        guid?: string | null
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
  siteTitle?: string
  siteDescription?: string
}

export default async function SliderLayout({ slider = [], siteTitle, siteDescription }: SliderLayoutProps) {
  if (!slider.length) {
    return null
  }

  let title = siteTitle
  let description = siteDescription

  if (!title || !description) {
    const chrome = await getSiteChrome()
    title = chrome.settings.title
    description = chrome.settings.description
  }

  return <SliderLayoutClient slides={slider} siteTitle={title ?? ''} siteDescription={description ?? ''} />
}
