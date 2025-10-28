export function getWordPressConfig() {
  const gqlEndpoint = process.env.NEXT_PUBLIC_WORDPRESS_GQL ?? process.env.WORDPRESS_GQL
  const restEndpoint = process.env.NEXT_PUBLIC_WORDPRESS_API ?? process.env.WORDPRESS_API
  const siteUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL ?? process.env.WORDPRESS_URL

  if (!gqlEndpoint) {
    throw new Error('Missing NEXT_PUBLIC_WORDPRESS_GQL environment variable')
  }

  if (!restEndpoint) {
    throw new Error('Missing NEXT_PUBLIC_WORDPRESS_API environment variable')
  }

  return {
    gqlEndpoint,
    restEndpoint,
    siteUrl: siteUrl ?? ''
  }
}
