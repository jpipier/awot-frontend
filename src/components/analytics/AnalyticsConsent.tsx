'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type AnalyticsConsentStatus = 'unknown' | 'granted' | 'denied'

interface AnalyticsConsentContextValue {
  analyticsConfigured: boolean
  isBannerOpen: boolean
  isHydrated: boolean
  status: AnalyticsConsentStatus
  accept: () => void
  reject: () => void
  openBanner: () => void
  closeBanner: () => void
}

const ANALYTICS_CONSENT_STORAGE_KEY = 'awot.analytics-consent'
const ANALYTICS_CONSENT_COOKIE_NAME = 'awot_analytics_consent'
const ANALYTICS_CONSENT_MAX_AGE = 60 * 60 * 24 * 365

const AnalyticsConsentContext = createContext<AnalyticsConsentContextValue | undefined>(undefined)

function hasMatomoConfig() {
  return Boolean(process.env.NEXT_PUBLIC_MATOMO_URL && process.env.NEXT_PUBLIC_MATOMO_SITE_ID)
}

function isAnalyticsConsentStatus(value: string | null | undefined): value is AnalyticsConsentStatus {
  return value === 'unknown' || value === 'granted' || value === 'denied'
}

function readStoredConsentStatus(): AnalyticsConsentStatus {
  if (typeof window === 'undefined') {
    return 'unknown'
  }

  try {
    const storedValue = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY)
    if (isAnalyticsConsentStatus(storedValue)) {
      return storedValue
    }
  } catch {
    // localStorage may be unavailable in private browsing or strict browser settings.
  }

  const cookieValue = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${ANALYTICS_CONSENT_COOKIE_NAME}=`))
    ?.split('=')
    .slice(1)
    .join('=')

  return isAnalyticsConsentStatus(cookieValue) ? cookieValue : 'unknown'
}

function persistConsentStatus(status: Exclude<AnalyticsConsentStatus, 'unknown'>) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, status)
  } catch {
    // Ignore storage failures and keep the cookie as fallback.
  }

  document.cookie = `${ANALYTICS_CONSENT_COOKIE_NAME}=${status}; Max-Age=${ANALYTICS_CONSENT_MAX_AGE}; Path=/; SameSite=Lax`
}

export function AnalyticsConsentProvider({
  children
}: {
  children: React.ReactNode
}) {
  const analyticsConfigured = hasMatomoConfig()
  const [status, setStatus] = useState<AnalyticsConsentStatus>('unknown')
  const [isHydrated, setIsHydrated] = useState(false)
  const [isBannerOpen, setIsBannerOpen] = useState(false)

  useEffect(() => {
    if (!analyticsConfigured) {
      setIsHydrated(true)
      return
    }

    const storedStatus = readStoredConsentStatus()
    setStatus(storedStatus)
    setIsBannerOpen(storedStatus === 'unknown')
    setIsHydrated(true)
  }, [analyticsConfigured])

  const value = useMemo<AnalyticsConsentContextValue>(
    () => ({
      analyticsConfigured,
      isBannerOpen,
      isHydrated,
      status,
      accept: () => {
        persistConsentStatus('granted')
        setStatus('granted')
        setIsBannerOpen(false)
      },
      reject: () => {
        persistConsentStatus('denied')
        setStatus('denied')
        setIsBannerOpen(false)
      },
      openBanner: () => {
        setIsBannerOpen(true)
      },
      closeBanner: () => {
        if (status !== 'unknown') {
          setIsBannerOpen(false)
        }
      }
    }),
    [analyticsConfigured, isBannerOpen, isHydrated, status]
  )

  return (
    <AnalyticsConsentContext.Provider value={value}>
      {children}
      <AnalyticsConsentBanner />
      <AnalyticsConsentShortcut />
    </AnalyticsConsentContext.Provider>
  )
}

export function useAnalyticsConsent() {
  const context = useContext(AnalyticsConsentContext)

  if (!context) {
    throw new Error('useAnalyticsConsent must be used within an AnalyticsConsentProvider')
  }

  return context
}

function AnalyticsConsentBanner() {
  const { analyticsConfigured, isBannerOpen, isHydrated, status, accept, reject, closeBanner } =
    useAnalyticsConsent()

  if (!analyticsConfigured || !isHydrated || !isBannerOpen) {
    return null
  }

  const canClose = status !== 'unknown'

  return (
    <div className="fixed inset-x-4 bottom-4 z-[90] md:left-6 md:right-auto md:max-w-xl">
      <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white/95 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-neutral-500">Mesure d&apos;audience</p>
            <h2 className="mt-2 font-custom text-2xl text-black">Cookies analytics</h2>
          </div>
          {canClose ? (
            <button
              type="button"
              onClick={closeBanner}
              className="text-xs uppercase tracking-[0.25em] text-neutral-500 transition hover:text-black"
              aria-label="Fermer la fenêtre cookies"
            >
              Fermer
            </button>
          ) : null}
        </div>

        <div className="space-y-5 px-5 py-4 text-sm text-neutral-700">
          <p>
            Ce site peut utiliser Matomo pour mesurer l&apos;audience et comprendre les pages consultées. Tu peux accepter
            ou refuser ce suivi.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reject}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
            >
              Refuser
            </button>
            <button
              type="button"
              onClick={accept}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-neutral-800"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsConsentShortcut() {
  const { analyticsConfigured, isBannerOpen, isHydrated, openBanner, status } = useAnalyticsConsent()

  if (!analyticsConfigured || !isHydrated || isBannerOpen || status !== 'denied') {
    return null
  }

  return (
    <button
      type="button"
      onClick={openBanner}
      className="fixed bottom-4 left-4 z-[80] inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 bg-white/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-black shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition hover:border-black hover:bg-black hover:text-white"
    >
      Cookies
    </button>
  )
}
