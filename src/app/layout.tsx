import type { Metadata, Viewport } from 'next'
import { Lato } from 'next/font/google'
import { Suspense } from 'react'
import '@/styles/globals.css'
import Header from '@/components/header/Header'
import { getSiteChrome } from '@/lib/site'
import { SiteChromeProvider } from '@/components/providers/SiteChromeProvider'
import ScrollSmootherProvider from '@/components/providers/ScrollSmootherProvider'
import IosInputZoomGuard from '@/components/providers/IosInputZoomGuard'
import { AnalyticsConsentProvider } from '@/components/analytics/AnalyticsConsent'
import MatomoTracker from '@/components/analytics/MatomoTracker'
import { getMetadataBaseUrl } from '@/lib/seo'

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-google-lato'
})

export const metadata: Metadata = {
  metadataBase: getMetadataBaseUrl(),
  title: {
    default: 'A Way of Travel',
    template: '%s | A Way of Travel'
  },
  description: 'Guide Landes & Pays Basque - A Way of Travel',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'A Way of Travel',
    title: 'A Way of Travel',
    description: 'Guide Landes & Pays Basque - A Way of Travel',
    url: '/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A Way of Travel',
    description: 'Guide Landes & Pays Basque - A Way of Travel'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const siteChrome = await getSiteChrome()
  const faviconHref = siteChrome.faviconUrl ?? '/favicon.ico'

  return (
    <html lang="fr" className={lato.variable}>
      <head>
        <link rel="icon" href={faviconHref} />
        <link rel="apple-touch-icon" href={faviconHref} />
      </head>
      <body>
        <AnalyticsConsentProvider>
          <Suspense fallback={null}>
            <MatomoTracker />
          </Suspense>
          <IosInputZoomGuard />
          <SiteChromeProvider value={siteChrome}>
            <Header />
            <ScrollSmootherProvider>
              <main>{children}</main>
            </ScrollSmootherProvider>
          </SiteChromeProvider>
        </AnalyticsConsentProvider>
      </body>
    </html>
  )
}
