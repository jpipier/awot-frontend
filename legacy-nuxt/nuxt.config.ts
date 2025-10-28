// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  modules: [
      '@nuxt/devtools',
      '@nuxtjs/tailwindcss',
      '@pinia/nuxt',
      '@nuxt/image'
  ],
  plugins: [
    '~/plugins/sticky.js'
  ],
  build: {
    transpile: ['@apollo/client', 'graphql-tag', 'swiper'],
  },
  image: {
    // Tu peux configurer une source ici, par exemple WordPress
    provider: 'ipx',
    dir: 'public',
    domains: [ 'backend.guide-landes-paysbasque.fr' ],
    format: ['webp'], // Active webp automatiquement si supporté
    screens: {
      sm: 320,
      md: 640,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    }
  },
  css: [
    'swiper/css', 
    'swiper/css/navigation', 
    'swiper/css/pagination',
    '@/assets/fonts/main.css',
    '~/assets/css/elementor.css',
    ],

  runtimeConfig: {
      public: {
          wordpressUrl: process.env.WORDPRESS_GQL,
          wordpressApi: process.env.WORDPRESS_API,
      }
  },
  compatibilityDate: '2025-01-06',
})