import type { Metadata } from 'next'
import Script from 'next/script'
import '@/styles/globals.css'
import Header from '@/components/header/Header'
import CarouselHoverCursor from '@/components/layout/CarouselHoverCursor'
import { getSiteChrome } from '@/lib/site'
import { SiteChromeProvider } from '@/components/providers/SiteChromeProvider'
import ScrollSmootherProvider from '@/components/providers/ScrollSmootherProvider'

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
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
  const facebookApiVersion = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION ?? 'v21.0'
  const shouldLoadFacebookSdk = Boolean(facebookAppId)

  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <SiteChromeProvider value={siteChrome}>
          <Header />
            <ScrollSmootherProvider>
              <main>{children}</main>
            </ScrollSmootherProvider>
        </SiteChromeProvider>
        <CarouselHoverCursor />
        {shouldLoadFacebookSdk ? (
          <>
            <Script
              id="facebook-sdk-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.fbAsyncInit = function() {
                    FB.init({
                      appId: '${facebookAppId}',
                      cookie: true,
                      xfbml: true,
                      version: '${facebookApiVersion}'
                    });

                    if (FB.AppEvents && FB.AppEvents.logPageView) {
                      FB.AppEvents.logPageView();
                    }
                  };
                `
              }}
            />
            <Script
              id="facebook-sdk-loader"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(d, s, id) {
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) { return; }
                    js = d.createElement(s); js.id = id;
                    js.src = "https://connect.facebook.net/en_US/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                  }(document, 'script', 'facebook-jssdk'));
                `
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  )
}
