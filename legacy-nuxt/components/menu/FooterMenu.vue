<script setup>
const config = useRuntimeConfig()

const { data: menuItems, error } = await useAsyncData(
  'footerMenu',
  async () => {
    const res = await $fetch(config.public.wordpressUrl, {
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

    return res?.data?.menu?.menuItems?.nodes || []
  },
  { server: true, lazy: false }
)
</script>

<template>
  <template v-if="error">
    <p class="text-xs italic text-red-500">Erreur de chargement du menu</p>
  </template>

  <template v-else-if="menuItems?.length">
    <ul>
      <li
        v-for="item in menuItems"
        :key="item.id"
        class="hover:underline transition lato-light"
      >
        <NuxtLink :to="item.path">{{ item.label }}</NuxtLink>
      </li>
    </ul>
  </template>

  <p v-else class="text-xs italic">Aucun menu disponible</p>
</template>