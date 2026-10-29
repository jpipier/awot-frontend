/**
 * Identité du site et réglages SEO centralisés.
 * Tout ce qui dépend du nom de marque ou du domaine passe par ici.
 */
export const SITE_NAME = 'Salt & Pine'

export const SITE_DESCRIPTION =
  'Salt & Pine : le guide des bonnes adresses, activités et voyages dans les Landes et au Pays Basque.'

export const SITE_TITLE_TEMPLATE = `%s | ${SITE_NAME}`

/** Domaines historiques à rediriger (301) vers le domaine défini par NEXT_PUBLIC_SITE_URL. */
export const DEFAULT_LEGACY_HOSTS = ['guide-landes-paysbasque.fr', 'www.guide-landes-paysbasque.fr']

function parseList(value: string | undefined, fallback: string[]) {
  if (!value || !value.trim()) {
    return fallback
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * Slugs des catégories "archives" (ancien blog). Par défaut : "1" (catégorie par défaut de WordPress)
 * et "archives-du-blog". Configurable via SEO_ARCHIVE_CATEGORY_SLUGS (liste séparée par des virgules).
 */
export function getArchiveCategorySlugs() {
  return parseList(process.env.SEO_ARCHIVE_CATEGORY_SLUGS, ['1', 'archives-du-blog'])
}

/** ID WordPress de la catégorie archives (utilisé pour le sitemap via l'API REST). */
export function getArchiveCategoryId() {
  const parsed = Number.parseInt(process.env.SEO_ARCHIVE_CATEGORY_ID ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

/**
 * Active le noindex + l'exclusion du sitemap pour les contenus d'archives.
 * Désactivé par défaut : à activer (SEO_NOINDEX_ARCHIVES=true) après avoir reclassé
 * les articles de qualité qui se trouvent encore dans la catégorie archives.
 */
export function isArchiveNoindexEnabled() {
  return process.env.SEO_NOINDEX_ARCHIVES === 'true'
}

export function isArchiveOnly(categorySlugs: Array<string | null | undefined>) {
  const archives = new Set(getArchiveCategorySlugs())
  const slugs = categorySlugs.filter((slug): slug is string => Boolean(slug))
  return slugs.length > 0 && slugs.every((slug) => archives.has(slug))
}
