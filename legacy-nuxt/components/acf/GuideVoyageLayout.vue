<template>
  <div class="my-20 max-w-screen-full mx-auto">
    <div class="flex items-center md:items-end flex-col md:flex-row">
      <h2 class="text-[60pt] md:text-[110pt] pl-0 lg:pl-[15rem] text-center lg:text-left font-custom text-[200pt] ">
        {{ titreDeLaSection }}
      </h2>
      <CategoryMenu slug="{{ categorie.nodes[0].slug }}" @select="onSubcategorySelect" />
    </div>
    <div v-if="loading" class="text-center mt-6">Chargement...</div>
    <div v-else-if="error" class="text-center mt-6 text-red-500">Erreur : {{ error }}</div>
    
    <div v-else class="flex flex-row items-top mt-10">
      <!-- Partie gauche fixe -->
      <div class="w-1/2 lg:w-2/6 text-left mb-10 lg:mb-0 px-[2rem] lg:px-[10rem]">
        <h2 class="text-[20px] uppercase font-brandon_grotesquemedium">{{ currentArticle.title }}</h2>
        <h3 class="text-[20px] text-gray-600 lato-light-italic">{{ currentArticle.location }}</h3>
        <p class="mt-4 text-sm lato-light font-[20pt]">{{ currentArticle.summary }}</p>
        <button class="mt-10 px-4 py-2 bg-black text-white text-sm uppercase lato-regular">Lire la suite</button>
      </div>

      <!-- Slider Swiper -->
      <div class="w-1/2 lg:w-4/6 overflow-hidden pl-[1rem]">
        <swiper
          class="mySwiper"
          :slides-per-view="1.2"
          :space-between="20"
          :breakpoints="{
            640: { slidesPerView: 1.7, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: 2.5, spaceBetween: 40 }
          }"
          @slideChange="onSlideChange"
        >
          <swiper-slide
            v-for="(post, index) in posts"
            :key="post.id"
            class="carousel-item "
          >
          <div class="slide-content group relative">
              <NuxtLink :to="'/articles/' + post.slug" prefetch>
                <div class="w-full h-[300px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden">
                  <NuxtImg
                    loading="lazy"
                    format="webp"
                    :src="post.optionsArticles.imagePortait?.node?.guid"
                    :srcset="post.optionsArticles.imagePortait?.node?.srcSet"
                    :alt="post.title"
                    class="w-full h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-lg"
                  />
                </div>
                <div class="mt-3">
                  <p
                    class="mb-1 font-brandon_grotesquelight_italic uppercase text-[12px] z-9"
                    v-html="post.categories?.edges?.[0]?.node.name"
                  ></p>
                  <h3 class="mt-2 text-[15px] font-brandon_grotesquemedium uppercase text-left">{{ post.title }}</h3>
                </div>
              </NuxtLink>
            </div>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import he from 'he'
import CategoryMenu from '~/components/menu/CategoryMenu.vue'

const { decode } = he
const config = useRuntimeConfig()

const props = defineProps({
  titreDeLaSection: String,
  categorie: Object
})

const currentArticle = ref({
  title: '',
  location: '',
  summary: ''
})

const { data: posts, pending: loading, error } = await useAsyncData(
  `posts-${props.categorie.nodes[0]?.slug || 'default'}`,
  async () => {
    const res = await $fetch(config.public.wordpressUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        query: `
          query GetPostsByCategory($categorySlug: String!, $limit: Int!) {
            posts(where: { categoryName: $categorySlug }, first: $limit) {
              edges {
                node {
                  id
                  title
                  excerpt
                  slug
                  optionsArticles {
                    imagePortait {
                      node {
                        guid
                        srcSet
                      }
                    }
                    champsLibrePageAccueil
                  }
                  categories(first:40) {
                    edges {
                      node {
                        id
                        name
                        slug
                        children {
                          nodes {
                            id
                            name
                            slug
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          categorySlug: props.categorie.nodes[0]?.slug || '',
          limit: 10
        }
      }
    })

    const articles = res.data.posts.edges.map(edge => edge.node)

    if (articles.length > 0) {
      currentArticle.value = {
        title: articles[0].title,
        location: articles[0].categories?.edges?.[0]?.node.name,
        summary: decode(articles[0].excerpt.replace(/<\/?[^>]+(>|$)/g, ''))
      }
    }

    return articles
  }
)

const onSlideChange = swiper => {
  const index = swiper.activeIndex
  const article = posts.value[index]
  if (article) {
    currentArticle.value = {
      title: article.title,
      location: article.categories?.edges?.[0]?.node.name,
      summary: decode(article.excerpt.replace(/<\/?[^>]+(>|$)/g, ''))
    }
  }
}
</script>