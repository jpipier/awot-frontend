/** @type {import('next').NextConfig} */
const LEGACY_HOSTS = (process.env.SEO_LEGACY_HOSTS || 'guide-landes-paysbasque.fr,www.guide-landes-paysbasque.fr')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)

function getCanonicalOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''

  try {
    return raw ? new URL(raw).origin : null
  } catch {
    return null
  }
}

const nextConfig = {
  // Redirections 301 de domaine : actives uniquement quand le domaine canonique
  // (NEXT_PUBLIC_SITE_URL) est différent des anciens domaines. Aucun effet tant que
  // le site est encore servi sur l'ancien domaine.
  async redirects() {
    const origin = getCanonicalOrigin()

    if (!origin) {
      return []
    }

    const canonicalHost = new URL(origin).host
    const hosts = new Set(LEGACY_HOSTS.filter((host) => host !== canonicalHost))

    if (!canonicalHost.startsWith('www.')) {
      hosts.add(`www.${canonicalHost}`)
    }

    return Array.from(hosts).map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: `${origin}/:path*`,
      permanent: true
    }))
  },

  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    workerThreads: false,
    cpus: 2
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 640, 750, 828, 1080, 1200, 1536, 1920, 2560, 3072],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend.guide-landes-paysbasque.fr',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*.wp.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*.gravatar.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
        pathname: '/**'
      }
    ]
  }
}

module.exports = nextConfig
