'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

export default function InstagramTokenToolPage() {
  const [code, setCode] = useState('')
  const [redirectUri, setRedirectUri] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<TokenPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !redirectUri) {
      const defaultUrl = `${window.location.origin}/auth/instagram`
      setRedirectUri(defaultUrl)
    }
  }, [redirectUri])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!code.trim() || !redirectUri.trim()) {
      setError('Merci de renseigner le code et le redirect URI.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/instagram/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          redirectUri: redirectUri.trim()
        })
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
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-custom text-4xl">Récupérer un token Instagram</h1>
        <p className="mt-4 text-neutral-700">
          1. Lance l’autorisation OAuth vers Instagram (voir la page{' '}
          <Link href="/auth/instagram" className="underline">
            /auth/instagram
          </Link>
          ) et copie le <code>code</code> renvoyé. 2. Colle-le ci-dessous avec le même{' '}
          <code>redirect_uri</code> et cette page te renverra les tokens short-lived et long-lived.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <div>
          <label className="block text-sm font-semibold text-neutral-700">Code Instagram</label>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="AQD7..."
            rows={3}
            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-800 focus:border-black focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700">Redirect URI</label>
          <input
            type="url"
            value={redirectUri}
            onChange={(event) => setRedirectUri(event.target.value)}
            placeholder="https://example.com/auth/instagram"
            className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-800 focus:border-black focus:outline-none"
            required
          />
          <p className="mt-2 text-xs text-neutral-500">
            Doit correspondre exactement à l’URL déclarée dans Meta Developers (ex.{' '}
            <span className="font-mono">https://guide-landes.fr/auth/instagram</span>).
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Récupération…' : 'Générer les tokens'}
        </button>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {result ? (
        <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <section>
            <h2 className="text-lg font-semibold text-neutral-900">Token short-lived</h2>
            {result.shortLived ? (
              <>
                <p className="mt-2 text-sm text-neutral-600">
                  Utilise ce token pour générer un long-lived token ou tester rapidement.
                </p>
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
                <p className="mt-2 text-sm text-neutral-600">À placer dans l’ENV `INSTAGRAM_ACCESS_TOKEN`.</p>
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
