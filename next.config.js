/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    workerThreads: false,
    cpus: 2
  },
  images: {
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
      }
    ]
  }
}

module.exports = nextConfig
