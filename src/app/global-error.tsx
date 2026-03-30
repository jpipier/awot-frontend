'use client'

import { useEffect } from 'react'

interface GlobalErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    console.error('Global error boundary caught an error', error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
          <h1 className="font-custom text-4xl">Le serveur a rencontre une erreur.</h1>
          <p className="mt-4 text-sm text-neutral-600">
            Clique sur Reessayer pour relancer la page sans redemarrer l application.
          </p>
          {error.digest ? <p className="mt-2 text-xs text-neutral-400">Digest: {error.digest}</p> : null}
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded border border-black px-4 py-2 text-sm uppercase tracking-[0.2em]"
          >
            Reessayer
          </button>
        </main>
      </body>
    </html>
  )
}
