<template>
  <div class="my-20">
    <div v-if="loading" class="text-center">Chargement...</div>
    <div v-else-if="error" class="text-center text-red-500">Erreur : {{ error }}</div>
    <div v-else 
      :class="{
        'max-w-screen-full mx-auto flex lg:flex-row items-end overflow-hidden mb-[3rem]': props.postParPage > 2,
        'max-w-screen-full mx-auto flex lg:flex-row items-center overflow-hidden': props.postParPage <= 2
      }">
      <div 
        :class="{
          'w-1/2 lg:w-2/5 px-4 md:px-10 lg:px-[10rem] text-left lg:mb-10': props.postParPage > 2,
          'w-1/2 lg:w-3/5 px-4 md:px-10 lg:px-[10rem] text-left ': props.postParPage <= 2
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
          >{{ titreDeLaSection }}</h2>
        <div 
          class="mt-4 pr-0  text-sm lato-light" 
          :class="{
            'lg:pr-[4rem] 3xl:pr-[10rem]': props.postParPage > 2,
            'lg:pr-[15rem] 3xl:pr-[22rem]': props.postParPage <= 2
          }"
          v-html="contenu">
        </div>
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
            1024: { slidesPerView: props.postParPage > 2 ? 2.5 : 1.5, spaceBetween: 40 }
          }"
          @slideChange="onSlideChange"
        >
          <swiper-slide
            v-for="(post, index) in posts"
            :key="post.id"
            class="carousel-item"
          >
            <div class="slide-content group relative">
              <NuxtLink :to="'/articles/' + post.slug">
                <div class="w-full h-[275px] md:h-[500px] lg:h-[490px] 3xl:h-[590px] overflow-hidden">
                  <img
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
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { useFetch } from '#app';

const config = useRuntimeConfig();

const props = defineProps({
  titreDeLaSection: String,
  categorie: Object,
  postParPage: String,
  headline: String,
  contenu: String,
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
          limit: props.postParPage,
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