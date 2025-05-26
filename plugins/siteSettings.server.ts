// plugins/siteSettings.server.ts
import { defineNuxtPlugin } from '#app'
import { useSiteSettings } from '~/stores/siteSettings'

export default defineNuxtPlugin(async () => {
  const store = useSiteSettings()
  await store.fetchSiteSettings()
})