const nextConfig = {
  reactStrictMode: true,
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

export default nextConfig
