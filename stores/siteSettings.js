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
        const { data } = await $fetch('/api/graphql', {
          method: 'POST',
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