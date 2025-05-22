<template>
  <div class="flex flex-col items-center w-full relative mx-auto px-3">
    <div class="flex flex-row max-w-2xl w-full mx-auto">
      <input
        type="text"
        v-model="searchQuery"
        @input="onInput"
        :placeholder="'Vous recherchez ' + currentPlaceholder"
        class="border border-gray-300 rounded-l p-2 w-full focus:outline-none focus:border-blue-500"
      />
      <button
        @click="fetchSuggestions"
        class="bg-black text-white px-4 rounded-r font-semibold hover:bg-gray-900 transition"
        aria-label="Rechercher"
      >
        Rechercher
      </button>
    </div>
    <ul
      v-if="suggestions.length"
      class="absolute left-0 right-0 max-w-2xl w-full z-10 bg-white shadow mt-1 rounded text-left mx-auto"
      style="top:100%;"
    >
      <li
        v-for="post in suggestions"
        :key="post.id"
        class="p-2 hover:bg-gray-200 cursor-pointer"
        @click="selectPost(post)"
      >
        {{ post.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { useRuntimeConfig, useFetch, useRouter } from '#imports'
import { debounce } from 'lodash'
import { Pagination, Navigation, Autoplay } from 'swiper/modules'
import { useSiteSettings } from '~/stores/siteSettings'

// Récupération de la configuration et du routeur
const config = useRuntimeConfig()
const router = useRouter()

// Définition des props attendues
const props = defineProps({
  titreDeLaSection: String,
  slider: Array,
})

// --- Code pour la recherche avec autosuggest ---
const searchQuery = ref('')
const suggestions = ref([])

const fetchSuggestions = async () => {
  // On ne lance la recherche qu'à partir de 3 caractères
  if (searchQuery.value.length < 3) {
    suggestions.value = []
    return
  }

  const query = `
    query searchPosts {
      posts(first: 30) {
        nodes {
          id
          title
          slug
          optionsArticles {
            keywordSearch {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await $fetch(config.public.wordpressUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    const allPosts = response?.data?.posts?.nodes || []
    const filteredPosts = allPosts.filter(post => {

      const keywords = post.optionsArticles?.keywordSearch?.edges?.map(edge => edge.node.name) || []
      const title = post.title || ''
      const normalize = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      const input = normalize(searchQuery.value)
      return (
        normalize(title).includes(input) ||
        keywords.some(keyword => normalize(keyword).includes(input))
      )
    })
    suggestions.value = filteredPosts
  } catch (err) {
    console.error("Erreur lors de la recherche:", err)
    suggestions.value = []
  }
}

const onInput = debounce(() => {
  fetchSuggestions()
}, 300)

const selectPost = (post) => {
  router.push(`/articles/${post.slug}`)
  suggestions.value = []
  searchQuery.value = post.title
}

const placeholders = [
  "un restaurant ?",
  "un hotel ?",
  "une idée de sortie ?"
]

const currentPlaceholder = ref("")
const currentPlaceholderIndex = ref(0) 
const currentCharIndex = ref(0)   

const typePlaceholder = () => {
  const phrase = placeholders[currentPlaceholderIndex.value]
  if (currentCharIndex.value < phrase.length) {
    currentPlaceholder.value += phrase[currentCharIndex.value]
    currentCharIndex.value++
    setTimeout(typePlaceholder, 30)
  } else {
    setTimeout(erasePlaceholder, 1000)
  }
}

const erasePlaceholder = () => {
  if (currentCharIndex.value > 0) {
    currentPlaceholder.value = currentPlaceholder.value.slice(0, -1)
    currentCharIndex.value--
    setTimeout(erasePlaceholder, 50)
  } else {
    currentPlaceholderIndex.value = (currentPlaceholderIndex.value + 1) % placeholders.length
    setTimeout(typePlaceholder, 200)
  }
}

  const settingsStore = useSiteSettings()

onMounted(() => {
  typePlaceholder()
})
</script>