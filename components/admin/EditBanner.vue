<template>
    coucou
  <div
    v-if="show"
    class="fixed bottom-0 left-0 right-0 bg-yellow-300 text-black text-sm p-3 text-center z-50 shadow"
  >
    ✏️ Vous êtes connecté à WordPress.
    <a
      :href="`https://votre-site-wp.fr/wp-admin/post.php?post=${postId}&action=edit`"
      target="_blank"
      class="underline ml-2 hover:text-blue-700"
    >
      Modifier cet article
    </a>
  </div>
  <div v-else>pas connecté</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  postId: {
    type: [String, Number],
    required: true
  }
})

const show = ref(false)

onMounted(() => {
  show.value = document.cookie.includes('wordpress_logged_in_')
})
</script>