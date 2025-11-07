'use client'

import { useState } from 'react'

interface TokenPayload {
  shortLived?: {
    access_token: string
    user_id?: number
    expires_in?: number
  }
  longLived?: {
    access_token?: string
    expires_in?: number
    token_type?: string
    error?: string
  } | null
  error?: string
}

interface InstagramTokenFetcherProps {
  code: string
  redirectUri: string
}

export default function InstagramTokenFetcher({ code, redirectUri }: InstagramTokenFetcherProps) {
  const [result, setResult] = useState<TokenPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleExchange() {
    if (!code || !redirectUri) {
      setError('Code ou redirect URI manquant.')
      return
    }

    setIsSubmitting(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/instagram/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri })
      })

      const payload = (await response.json()) as TokenPayload

      if (!response.ok) {
        throw new Error(payload.error ?? 'Impossible de récupérer le token.')
      }

      setResult(payload)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Erreur inconnue.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-10 space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-neutral-600">
            Code : <span className="font-mono text-xs">{code}</span>
          </p>
          <p className="text-xs text-neutral-500">Redirect URI : {redirectUri}</p>
        </div>
        <button
          type="button"
          onClick={handleExchange}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Échange en cours…' : 'Échanger contre un token'}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {result ? (
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Token short-lived</h2>
            {result.shortLived ? (
              <>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs text-green-400">
{result.shortLived.access_token}
                </pre>
                <ul className="mt-3 text-xs text-neutral-500">
                  {typeof result.shortLived.user_id !== 'undefined' ? (
                    <li>
                      <span className="font-semibold text-neutral-700">user_id</span> : {result.shortLived.user_id}
                    </li>
                  ) : null}
                  {typeof result.shortLived.expires_in !== 'undefined' ? (
                    <li>
                      <span className="font-semibold text-neutral-700">expires_in</span> :{' '}
                      {Math.round(result.shortLived.expires_in / 3600)} h
                    </li>
                  ) : null}
                </ul>
              </>
            ) : (
              <p className="text-sm text-neutral-600">Aucun token short-lived n’a été renvoyé.</p>
            )}
          </section>
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Token long-lived</h2>
            {result.longLived?.access_token ? (
              <>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs text-yellow-200">
{result.longLived.access_token}
                </pre>
                {typeof result.longLived.expires_in !== 'undefined' ? (
                  <p className="mt-3 text-xs text-neutral-500">
                    expire dans ~{Math.round((result.longLived.expires_in ?? 0) / 86400)} jours
                  </p>
                ) : null}
              </>
            ) : result.longLived?.error ? (
              <p className="text-sm text-red-600">Impossible d’obtenir le token long terme : {result.longLived.error}</p>
            ) : (
              <p className="text-sm text-neutral-600">Aucun token long terme n’a été renvoyé.</p>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}
