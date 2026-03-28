/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    workerThreads: false,
    cpus: 2
  },
  images: {
    formats: ['image/avif', 'image/webp'],
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
