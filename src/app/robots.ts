import type { MetadataRoute } from 'next'
import { getMetadataBaseUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const metadataBase = getMetadataBaseUrl()
  const origin = metadataBase ? metadataBase.origin : ''

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/', '/recherche']
    },
    sitemap: origin ? [`${origin}/sitemap.xml`] : ['/sitemap.xml'],
    ...(origin ? { host: origin } : {})
  }
}
