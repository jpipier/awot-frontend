import Link from 'next/link'
import dynamic from 'next/dynamic'

interface InstagramAuthPageProps {
  searchParams: {
    code?: string
    state?: string
    error?: string
    error_description?: string
  }
}

const instagramClientId =
  process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID ??
  process.env.INSTAGRAM_APP_ID ??
  process.env.META_APP_ID ??
  ''

const instagramRedirectUri =
  process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI ??
  process.env.INSTAGRAM_REDIRECT_URI ??
  ''

const instagramScopes =
  process.env.NEXT_PUBLIC_INSTAGRAM_SCOPES ??
  process.env.INSTAGRAM_SCOPES ??
  'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights'

const instagramAuthUrl =
  instagramClientId && instagramRedirectUri
    ? `https://api.instagram.com/oauth/authorize?client_id=${encodeURIComponent(
        instagramClientId
      )}&redirect_uri=${encodeURIComponent(
        instagramRedirectUri
      )}&response_type=code&scope=${encodeURIComponent(instagramScopes)}&force_reauth=true`
    : null

const InstagramTokenFetcher = dynamic(() => import('./InstagramTokenFetcher'), { ssr: false })

export default function InstagramAuthPage({ searchParams }: InstagramAuthPageProps) {
  const { code, state, error, error_description: errorDescription } = searchParams

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="font-custom text-4xl">Connexion Instagram</h1>
        <p className="mt-6 text-lg text-red-600">Instagram a renvoyé une erreur : {error}</p>
        {errorDescription ? <p className="mt-2 text-sm text-red-500">{errorDescription}</p> : null}
      </div>
    )
  }

  if (!code) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <h1 className="font-custom text-4xl">Connexion Instagram</h1>
        <p className="mt-6 text-lg text-neutral-700">
          Aucun paramètre <code>code</code> n’a été fourni par Instagram. Relance l’autorisation depuis l’URL OAuth.
        </p>
        {instagramAuthUrl ? (
          <Link
            href={instagramAuthUrl}
            className="mt-6 inline-flex rounded-full bg-[#E4405F] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#c0334b]"
          >
            Autoriser Instagram
          </Link>
        ) : (
          <p className="mt-4 text-sm text-red-600">
            Impossible de générer l’URL d’autorisation : configure <code>INSTAGRAM_APP_ID</code> et{' '}
            <code>INSTAGRAM_REDIRECT_URI</code> (ou leurs équivalents publics).
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-custom text-4xl">Code reçu</h1>
      <p className="mt-6 text-lg text-neutral-700">
        Copie ce code pour l’utiliser dans la requête <code>curl</code> afin d’obtenir le token d’accès :
      </p>
      <pre className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm">
{code}
      </pre>
      {state ? (
        <p className="mt-4 text-sm text-neutral-500">
          Paramètre <code>state</code> : <span className="font-mono">{state}</span>
        </p>
      ) : null}
      {instagramRedirectUri ? (
        <InstagramTokenFetcher code={code} redirectUri={instagramRedirectUri} />
      ) : (
        <p className="mt-6 text-sm text-red-600">
          Configure <code>INSTAGRAM_REDIRECT_URI</code> pour pouvoir échanger automatiquement le code contre un token.
        </p>
      )}
    </div>
  )
}
