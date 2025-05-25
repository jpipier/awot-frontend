import { defineStore } from 'pinia';

export const useSiteSettings = defineStore('siteSettings', {
  state: () => ({
    siteTitle: '',
    siteDescription: '',
  }),
  actions: {
    async fetchSiteSettings() {
      const config = useRuntimeConfig();
      const query = `
        query GetSiteSettings {
          generalSettings {
            title
            description
          }
        }
      `;

      try {
        const { data } = await $fetch(config.public.wordpressUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { query }
        });

        // data === { generalSettings: { title, description } }
        this.siteTitle        = data.generalSettings?.title       || '';
        this.siteDescription  = data.generalSettings?.description || '';
      } catch (err) {
        console.error('Erreur lors de la récupération des réglages généraux :', err);
      }
    }
  }
});