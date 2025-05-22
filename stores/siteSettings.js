import { defineStore } from 'pinia';

export const useSiteSettings = defineStore('siteSettings', {
  state: () => ({
    siteTitle: '',
    siteDescription: '',
  }),
  actions: {
    async fetchSiteSettings() {
      const config = useRuntimeConfig()
      const query = `
        query GetSiteSettings {
          generalSettings {
            title
            description
          }
        }
      `
      try {
        const response = await $fetch(config.public.wordpressUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        })
        this.siteTitle = response?.data?.generalSettings?.title || ''
        this.siteDescription = response?.data?.generalSettings?.description || ''
      } catch (error) {
        console.error('Erreur lors de la récupération des réglages généraux :', error)
      }
    }
  }
})