import Link from 'next/link'

export default function FacebookBusinessAuthPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-16">
      <div>
        <p className="uppercase text-xs tracking-[0.4em] text-neutral-500">Facebook Login</p>
        <h1 className="mt-2 font-custom text-4xl">Connexion Facebook Business</h1>
        <p className="mt-4 text-neutral-700">
          Utilise cette page pour lancer le login Facebook Business et récupérer un token utilisateur longue durée pour
          accéder aux ressources Pages/Instagram via la Graph API.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <ol className="list-decimal space-y-4 pl-5 text-sm text-neutral-700">
          <li>
            Vérifie que <code>META_APP_ID</code> / <code>META_APP_SECRET</code> sont renseignées dans l’environnement
            serveur.
          </li>
          <li>
            Dans <strong>developers.facebook.com</strong>, ajoute{' '}
            <code>https://votre-domaine/auth/facebook/business/callback</code> dans les “Valid OAuth Redirect URIs”.
          </li>
          <li>
            Clique sur le bouton ci-dessous, connecte-toi avec le compte Business souhaité et autorise l’application.
          </li>
        </ol>
        <Link
          href="/auth/facebook/business/start"
          className="mt-6 inline-flex rounded-full bg-[#0866FF] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#0650c7]"
        >
          Se connecter avec Facebook
        </Link>
      </div>
    </div>
  )
}
