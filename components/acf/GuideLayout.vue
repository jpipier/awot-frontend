<template>
  <div class="bg-zinc-900 my-20 max-w-screen-full mx-auto">
    <div v-if="loading" class="text-center text-white py-6">Chargement...</div>
    <div v-else-if="error" class="text-center text-red-500 py-6">Erreur : {{ error }}</div>

    <div v-else class="flex flex-col lg:flex-row items-center lg:h-[80vh]">
      <div class="w-full lg:w-10/12 relative">
        <swiper
          class="mySwiper"
          :slides-per-view="1"
          :space-between="20"
          :effect="'fade'"
          :navigation="{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }"
          :pagination="{
            el: '.custom-pagination',
            clickable: true,
          }"
          @slideChange="onSlideChange"
        >
          <swiper-slide
            v-for="(post, index) in posts"
            :key="post.id"
            class="carousel-item transition-shadow duration-300"
          >
            <div class="relative">
              <NuxtLink :to="'/articles/' + post.slug">
                <img
                  :src="post.optionsArticles.imagePaysage?.node?.guid"
                  :srcset="post.optionsArticles.imagePaysage?.node?.srcSet"
                  :alt="post.title"
                  class="w-full h-[500px] md:h-[450px] lg:h-[80vh] object-cover"
                />
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center text-white">
                  <h3 class="text-2xl md:text-4xl lg:text-6xl font-schnyder_wide_xl_webdemi">
                    {{ post.title }}
                  </h3>
                  <h4 class="text-sm md:text-lg uppercase mt-2 md:mt-4 font-montserrat">
                    {{ post.optionsArticles.champsLibrePageAccueil }}
                  </h4>
                </div>
              </NuxtLink>
            </div>
          </swiper-slide>
        </swiper>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
          <div class="custom-pagination"></div>
      </div>
      <div class="w-full lg:w-2/12 flex items-center justify-center my-6 lg:my-0">
        <NuxtLink
          :to="lien.url"
          class="px-4 py-2 text-white text-sm uppercase font-montserrat rounded-md transform rotate-0 lg:-rotate-90"
        >
          {{ lien.title }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, watch } from 'vue';
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import SwiperCore from 'swiper';
  import { Navigation, Pagination, EffectFade } from 'swiper/modules';
  SwiperCore.use([Navigation, Pagination, EffectFade]);

  import { useFetch } from '#app';
  import 'swiper/css';

  import 'swiper/css/effect-fade';
  
  const config = useRuntimeConfig();
  
  const props = defineProps({
    titreDeLaSection: String,
    categorie: Object,
    lien : Object,
  });
  const posts = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const currentArticle = ref({
    title: '',
    location: '',
    summary: '',
  });

  const fetchPosts = async () => {
    loading.value = true;
    error.value = null;
  
    try {
      const { data } = await useFetch(config.public.wordpressUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
                      imagePaysage {
                        node {
                          guid
                          srcSet
                        }
                      }
                      champsLibrePageAccueil
                      champsLibre
                    }
                  }
                }
              }
            }
          `,
          variables: {
            categorySlug: props.categorie.nodes[0]?.slug || '',
            limit: 10,
          },
        }),
        key: props.categorie.nodes[0]?.slug || 'default-key',
        transform: (data) => data.data.posts.edges.map((edge) => edge.node),
      });

      posts.value = data.value || [];
      if (posts.value.length > 0) {
        currentArticle.value = {
          title: posts.value[0].title,
          location: posts.value[0].categories.edges[0].node.name,
          summary: posts.value[0].excerpt,
        };
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  fetchPosts();
  
  const onSlideChange = (swiper) => {
    const index = swiper.activeIndex;
    const article = posts.value[index];

    if (article) {
      currentArticle.value = {
        title: article.title,
        location: article.categories.edges[0].node.name,
        summary: article.excerpt.replace(/<\/?[^>]+(>|$)/g, ''),
      };
    }
  };
</script>

<style scoped>
  .swiper-button-next,
  .swiper-button-prev {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Changer l’icône de la flèche avec du texte ou un SVG perso */
  .swiper-button-next::after,
  .swiper-button-prev::after {
    font-size: 20px;
    font-weight: bold;
    color: white;
  }
  .custom-pagination{
    bottom: var(--swiper-pagination-bottom, 8px);
      top: var(--swiper-pagination-top, auto);
      left: 0;
      width: 100%;
      position: absolute;
      text-align: center;
      transition: 300ms opacity;
      transform: translate3d(0, 0, 0);
      z-index: 10;
  }
  :deep(.custom-pagination .swiper-pagination-bullet) {
    background: rgba(0, 0, 0, 1) !important;
    transition: width 0.3s ease, background-color 0.3s ease;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  :deep(.custom-pagination .swiper-pagination-bullet-active) {
    background: #ffffff !important;
    width: 25px;
    border-radius: 10px;
  }
</style>