<script setup>
const config = useRuntimeConfig()

const { data: menuData, error } = await useAsyncData('footerMenu', async () => {
  const response = await $fetch(config.public.wordpressUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetFooterMenu {
          menu(id: "footer", idType: SLUG) {
            menuItems(first: 100) {
              nodes {
                id
                label
                path
              }
            }
          }
        }
      `
    })
  })

  return response?.data?.menu?.menuItems?.nodes || []
})

if (error.value) {
  console.error('Erreur chargement menu footer', error.value)
}
</script>

<template>
  <ul v-if="menuData?.value?.length">
    <li
      v-for="item in menuData.value"
      :key="item.id"
      class="hover:underline transition"
    >
      <NuxtLink :to="item.path">{{ item.label }}</NuxtLink>
    </li>
  </ul>
  <p v-else class="text-xs italic">Aucun menu disponible</p>
</template>