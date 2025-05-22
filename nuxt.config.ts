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
          wordpressUrl: 'http://backend.awot.local/wp/graphql',
          wordpressApi: 'http://backend.awot.local/wp-json'          
          // wordpressUrl: 'https://awot.theshed.fr/wp/graphql',
          // wordpressApi: 'https://awot.theshed.fr/wp-json'
      }
  },
  compatibilityDate: '2025-01-06',
})