import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

export const useSiteSettings = defineStore(
  'siteSettings',
  () => {
    const config = useRuntimeConfig()
    const siteTitle = ref('')
    const siteDescription = ref('')

    async function fetchSiteSettings() {
      const query = /* GraphQL */ `
        query GetSiteSettings {
          generalSettings { title description }
        }
      `
      try {
        const { data } = await $fetch(config.public.wordpressUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { query }
        })
        siteTitle.value       = data.generalSettings?.title       || ''
        siteDescription.value = data.generalSettings?.description || ''
      } catch (err) {
        console.error('Erreur fetchSiteSettings:', err)
      }
    }

    return { siteTitle, siteDescription, fetchSiteSettings }
  }
)