import { cookies } from 'next/headers'
import FacebookTokenFetcher from './FacebookTokenFetcher'

interface CallbackPageProps {
  searchParams: {
    code?: string
    state?: string
    error?: string
    error_description?: string
  }
}

export default function FacebookBusinessCallbackPage({ searchParams }: CallbackPageProps) {
  const cookieStore = cookies()
  const expectedState = cookieStore.get('fb_login_state')?.value ?? null
  const { code, state, error, error_description: errorDescription } = searchParams
  const stateValid = Boolean(code && state && expectedState && state === expectedState)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <p className="uppercase text-xs tracking-[0.4em] text-neutral-500">Facebook Login</p>
        <h1 className="mt-2 font-custom text-4xl">Callback Business</h1>
        <p className="mt-4 text-neutral-700">
          Cette page reçoit les paramètres <code>code</code> et <code>state</code> envoyés par Facebook. Vérifie ci-dessous
          que tout est correct puis échange le code contre un token long terme.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Facebook a renvoyé une erreur : <strong>{error}</strong>
          {errorDescription ? <div className="mt-2 text-xs text-red-500">{errorDescription}</div> : null}
        </div>
      ) : null}

      {!code && !error ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          Aucun paramètre <code>code</code> n’a été fourni. Relance l’authentification depuis{' '}
          <code>/auth/facebook/business</code>.
        </div>
      ) : null}

      {code ? <FacebookTokenFetcher code={code} stateValid={stateValid} /> : null}
    </div>
  )
}
