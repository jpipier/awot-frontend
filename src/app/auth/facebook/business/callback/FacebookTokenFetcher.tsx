'use client'

import { useEffect, useMemo, useState } from 'react'

interface ExchangeResponse {
  shortLived?: {
    access_token: string
    token_type?: string
    expires_in?: number
  }
  longLived?: {
    access_token?: string
    token_type?: string
    expires_in?: number
    error?: string
  }
  debug?: Record<string, unknown>
  error?: string
}

interface FacebookTokenFetcherProps {
  code: string
  stateValid: boolean
}

export default function FacebookTokenFetcher({ code, stateValid }: FacebookTokenFetcherProps) {
  const [redirectUri, setRedirectUri] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ExchangeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUri(`${window.location.origin}/auth/facebook/business/callback`)
    }
  }, [])

  const disabled = useMemo(() => !redirectUri || !stateValid || !code, [redirectUri, stateValid, code])

  async function handleExchange() {
    if (disabled) return
    setIsSubmitting(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/facebook/business/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri })
      })

      const payload = (await response.json()) as ExchangeResponse

      if (!response.ok) {
        throw new Error(payload.error ?? 'Impossible de récupérer les tokens Facebook.')
      }

      setResult(payload)
    } catch (exchangeError) {
      setError(exchangeError instanceof Error ? exchangeError.message : 'Erreur inconnue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!stateValid) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        Le paramètre <code>state</code> ne correspond pas au cookie attendu. Relance l’authentification depuis{' '}
        <code>/auth/facebook/business</code>.
      </p>
    )
  }

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm text-neutral-600">
          Code reçu : <span className="font-mono text-xs">{code}</span>
        </p>
        <button
          type="button"
          onClick={handleExchange}
          disabled={disabled || isSubmitting}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#0866FF] px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#0650c7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Échange en cours…' : 'Échanger contre un token'}
        </button>
        <p className="mt-2 text-xs text-neutral-500">
          Utilise ensuite le token long terme comme <code>FACEBOOK_USER_ACCESS_TOKEN</code> ou pour générer un token
          système.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      ) : null}

      {result ? (
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Token short-lived</h2>
            {result.shortLived?.access_token ? (
              <>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs text-green-400">
{result.shortLived.access_token}
                </pre>
                <p className="mt-2 text-xs text-neutral-500">
                  expires_in : {Math.round((result.shortLived.expires_in ?? 0) / 3600)} h
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">Aucun token short-lived.</p>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Token long-lived</h2>
            {result.longLived?.access_token ? (
              <>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs text-yellow-200">
{result.longLived.access_token}
                </pre>
                <p className="mt-2 text-xs text-neutral-500">
                  expires_in ≈ {Math.round((result.longLived.expires_in ?? 0) / 86400)} jours
                </p>
              </>
            ) : result.longLived?.error ? (
              <p className="mt-3 text-sm text-red-600">Erreur token long terme : {result.longLived.error}</p>
            ) : (
              <p className="mt-3 text-sm text-neutral-600">Aucun token long terme.</p>
            )}
          </section>

          {result.debug ? (
            <section>
              <h2 className="text-lg font-semibold text-neutral-900">Infos debug Graph API</h2>
              <pre className="mt-3 max-h-80 overflow-y-auto rounded-lg bg-neutral-50 p-4 text-xs text-neutral-700">
{JSON.stringify(result.debug, null, 2)}
              </pre>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
