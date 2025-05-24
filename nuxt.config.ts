// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  modules: [
      '@nuxt/devtools',
      '@nuxtjs/tailwindcss',
      '@pinia/nuxt'
  ],
  plugins: [
    '~/plugins/sticky.js'
  ],
  build: {
    transpile: ['@apollo/client', 'graphql-tag', 'swiper'],
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
          wordpressUrl: process.env.WORDPRESS_URL,
          wordpressApi: process.env.WORDPRESS_API
      }
  },
  compatibilityDate: '2025-01-06',
})