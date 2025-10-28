<template>
  <div class="my-20">
    <div v-if="loading" class="text-center">Chargement...</div>
    <div v-else-if="error" class="text-center text-red-500">
      Erreur : {{ error.message || error }}
    </div>
    <div
      v-else
      :class="{
        'max-w-screen-full mx-auto flex lg:flex-row items-end overflow-hidden mb-[3rem]': props.postParPage > 2,
        'max-w-screen-full mx-auto flex lg:flex-row items-center overflow-hidden': props.postParPage <= 2
      }"
    >
    <div
        :class="{
          'w-1/2 lg:w-2/5 px-4 px-[4rem] md:px-[8rem] lg:px-[10rem] text-left lg:mb-10': props.postParPage > 2,
          'w-1/2 lg:w-3/5 px-4 md:px-10 lg:px-[10rem] text-left': props.postParPage <= 2
        }"
        class="mb-10 lg:mb-0 lg:text-left"
      >
        <h3 class="lg:text-sm lg:text-lg lato-light">{{ headline }}</h3>
        <h2
          class="lg:text-[5rem] font-schnyder_wide_xl_webdemi"
          :class="{
            'text-[4rem]': props.postParPage > 2,
            'text-[3rem] z-10 relative': props.postParPage <= 2
          }"
        >
          {{ titreDeLaSection }}
        </h2>
        <div
          class="mt-4 pr-0 text-sm lato-light"
          :class="{
            'pr-[0rem] lg:pr-[0rem] xl:pr-[4rem] 3xl:pr-[10rem]': props.postParPage > 2,
            'lg:pr-[15rem] 3xl:pr-[22rem]': props.postParPage <= 2
          }"
          v-html="contenu"
        ></div>
      </div>

      <!-- Slider Swiper -->
      <div
        :class="{
          'w-1/2 lg:w-3/5': props.postParPage > 2,
          'w-1/2 lg:w-2/5': props.postParPage <= 2
        }"
        class="overflow-hidden pl-5 lg:pl-0"
      >
        <swiper
          class="mySwiper"
          :slides-per-view="1.2"
          :space-between="20"
          :breakpoints="{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 30 },
            1024: { slidesPerView: props.postParPage > 2 ? 2.5 : 1.5, spaceBetween: 20 }
          }"
          @slideChange="onSlideChange"
        >
          <swiper-slide
            v-for="(post, index) in posts"
            :key="post.id"
            class="carousel-item"
          >
            <div class="slide-content group relative">
              <NuxtLink :to="'/articles/' + post.slug" prefetch>
                <div
                  class="w-full h-[275px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden"
                >
                  <NuxtImg
                    loading="lazy"
                    placeholder="blur"
                    format="webp"
                    :src="post.optionsArticles.imagePortait?.node?.guid"
                    :srcset="post.optionsArticles.imagePortait?.node?.srcSet"
                    :alt="post.title"
                    class="h-[300px] md:h-[450px] lg:h-[490px] 3xl:h-[590px] w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 rounded-md shadow-md"
                  />
                </div>
                <div class="mt-3">
                  <p
                    class="mb-1 font-brandon_grotesquelight_italic uppercase text-xs z-9"
                    v-html="post.optionsArticles?.champsLibrePageAccueil"
                  ></p>
                  <h3 class="text-base font-brandon_grotesquemedium uppercase">
                    {{ post.title }}
                  </h3>
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
import { Swiper, SwiperSlide } from 'swiper/vue'
import { ref } from 'vue'
const config = useRuntimeConfig()

const props = defineProps({
  titreDeLaSection: String,
  categorie: Object,
  postParPage: Number,
  headline: String,
  contenu: String
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
                  categories {
                    edges {
                      node {
                        name
                      }
                    }
                  }
                  optionsArticles {
                    imagePortait {
                      node {
                        guid
                        srcSet
                      }
                    }
                    champsLibrePageAccueil
                  }
                }
              }
            }
          }
        `,
        variables: {
          categorySlug: props.categorie.nodes[0]?.slug || '',
          limit: props.postParPage
        }
      }
    })

    return res.data.posts.edges.map(edge => edge.node)
  }
)

const currentArticle = ref({ title: '', location: '', summary: '' })

const onSlideChange = swiper => {
  const index = swiper.activeIndex
  const article = posts.value[index]
  if (article) {
    currentArticle.value = {
      title: article.title,
      location: article.categories.edges[0].node.name,
      summary: article.excerpt.replace(/<\/?[^>]+(>|$)/g, '')
    }
  }
}
</script>