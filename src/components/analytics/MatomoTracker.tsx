'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAnalyticsConsent } from './AnalyticsConsent'

type MatomoCommand = [string, ...unknown[]]

declare global {
  interface Window {
    _paq?: MatomoCommand[]
    __awotMatomoInitialized?: boolean
  }
}

const MATOMO_SCRIPT_ID = 'awot-matomo-script'
const MATOMO_CONSENT_COOKIE_NAMES = ['_pk_', 'mtm']

function normalizeMatomoBaseUrl(value?: string | null) {
  if (!value) {
    return null
  }

  return value.endsWith('/') ? value : `${value}/`
}

function deleteCookie(name: string, domain?: string) {
  const domainAttribute = domain ? ` Domain=${domain};` : ''
  document.cookie = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/;${domainAttribute} SameSite=Lax`
}

function clearMatomoCookies() {
  if (typeof window === 'undefined') {
    return
  }

  const cookieNames = document.cookie
    .split(';')
    .map((entry) => entry.trim().split('=')[0])
    .filter((name) => MATOMO_CONSENT_COOKIE_NAMES.some((prefix) => name.startsWith(prefix)))

  if (!cookieNames.length) {
    return
  }

  const domains = new Set<string | undefined>([undefined, window.location.hostname])
  const hostnameSegments = window.location.hostname.split('.')

  if (hostnameSegments.length >= 2) {
    domains.add(`.${hostnameSegments.slice(-2).join('.')}`)
  }

  cookieNames.forEach((name) => {
    domains.forEach((domain) => {
      deleteCookie(name, domain)
    })
  })
}

export default function MatomoTracker() {
  const { analyticsConfigured, status } = useAnalyticsConsent()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isReady, setIsReady] = useState(false)
  const lastTrackedUrlRef = useRef<string | null>(null)

  const matomoBaseUrl = useMemo(() => normalizeMatomoBaseUrl(process.env.NEXT_PUBLIC_MATOMO_URL), [])
  const matomoSiteId = useMemo(() => process.env.NEXT_PUBLIC_MATOMO_SITE_ID?.trim() ?? '', [])
  const shouldDisableCookies = useMemo(
    () =>
      ['1', 'true', 'yes', 'on'].includes(
        (process.env.NEXT_PUBLIC_MATOMO_DISABLE_COOKIES ?? '').trim().toLowerCase()
      ),
    []
  )
  const search = searchParams?.toString() ?? ''

  useEffect(() => {
    if (
      !analyticsConfigured ||
      !matomoBaseUrl ||
      !matomoSiteId ||
      typeof window === 'undefined' ||
      (status !== 'granted' && !window.__awotMatomoInitialized)
    ) {
      return
    }

    window._paq = window._paq ?? []

    if (!window.__awotMatomoInitialized) {
      window._paq.push(['requireConsent'])
      if (shouldDisableCookies) {
        window._paq.push(['disableCookies'])
      }
      window._paq.push(['setTrackerUrl', `${matomoBaseUrl}matomo.php`])
      window._paq.push(['setSiteId', matomoSiteId])
      window._paq.push(['enableLinkTracking'])
      window.__awotMatomoInitialized = true
    }

    const existingScript = document.getElementById(MATOMO_SCRIPT_ID) as HTMLScriptElement | null
    const handleLoad = () => {
      setIsReady(true)
    }
    const handleError = () => {
      console.error('[MatomoTracker] Impossible de charger le script Matomo.')
    }

    if (existingScript) {
      if (existingScript.dataset.loaded === 'true') {
        setIsReady(true)
      } else {
        existingScript.addEventListener('load', handleLoad)
        existingScript.addEventListener('error', handleError)
      }

      return () => {
        existingScript.removeEventListener('load', handleLoad)
        existingScript.removeEventListener('error', handleError)
      }
    }

    const script = document.createElement('script')
    script.id = MATOMO_SCRIPT_ID
    script.async = true
    script.src = `${matomoBaseUrl}matomo.js`
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      handleLoad()
    })
    script.addEventListener('error', handleError)
    document.head.appendChild(script)

    return () => {
      script.removeEventListener('error', handleError)
    }
  }, [analyticsConfigured, matomoBaseUrl, matomoSiteId, shouldDisableCookies, status])

  useEffect(() => {
    if (!analyticsConfigured || !isReady || typeof window === 'undefined') {
      return
    }

    window._paq = window._paq ?? []

    if (status === 'granted') {
      window._paq.push(['rememberConsentGiven'])
      return
    }

    window._paq.push(['forgetConsentGiven'])
    window._paq.push(['deleteCookies'])
    clearMatomoCookies()
    lastTrackedUrlRef.current = null
  }, [analyticsConfigured, isReady, status])

  useEffect(() => {
    if (!analyticsConfigured || !isReady || status !== 'granted' || typeof window === 'undefined') {
      return
    }

    const resolvedPath = pathname ?? '/'
    const currentUrl = new URL(search ? `${resolvedPath}?${search}` : resolvedPath, window.location.origin).toString()

    if (lastTrackedUrlRef.current === currentUrl) {
      return
    }

    window._paq = window._paq ?? []

    if (lastTrackedUrlRef.current) {
      window._paq.push(['setReferrerUrl', lastTrackedUrlRef.current])
    }

    window._paq.push(['setCustomUrl', currentUrl])
    window._paq.push(['setDocumentTitle', document.title])
    window._paq.push(['trackPageView'])
    lastTrackedUrlRef.current = currentUrl
  }, [analyticsConfigured, isReady, pathname, search, status])

  return null
}
