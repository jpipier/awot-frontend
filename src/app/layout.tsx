import type { Metadata } from 'next'
import '@/styles/globals.css'
import Header from '@/components/header/Header'
import { getSiteChrome } from '@/lib/site'
import { SiteChromeProvider } from '@/components/providers/SiteChromeProvider'

export const metadata: Metadata = {
  title: 'A Way of Travel',
  description: 'Guide Landes & Pays Basque - A Way of Travel'
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const siteChrome = await getSiteChrome()

  return (
    <html lang="fr">
      <body>
        <SiteChromeProvider value={siteChrome}>
          <Header />
          <main>{children}</main>
        </SiteChromeProvider>
      </body>
    </html>
  )
}
