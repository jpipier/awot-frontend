'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Route error boundary caught an error', error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="font-custom text-4xl">Une erreur temporaire est survenue.</h1>
      <p className="mt-4 text-sm text-neutral-600">
        Merci de reessayer. Si le probleme persiste, verifie les logs serveur.
      </p>
      {error.digest ? <p className="mt-2 text-xs text-neutral-400">Digest: {error.digest}</p> : null}
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded border border-black px-4 py-2 text-sm uppercase tracking-[0.2em]"
      >
        Reessayer
      </button>
    </div>
  )
}
