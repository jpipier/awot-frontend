<template>
    <div
      ref="blocPortrait"
      class="h-screen sm:flex sm:flex-col lg:block  align-center py-20 relative mb-40 md:mb-0 lg:my-20 transition-colors duration-500 bloc-portrait overflow-hidden"
      :class="{ 'bg-black': isVisible, 'bg-white': !isVisible }"
    >
      <div 
        class="sm:relative lg:absolute top-[6vw] sm:right-[10.5vw] lg:right-[0.5vw] w-50 md:w-full lg:w-1/2 flex flex-col lg:pl-6 lg:pr-24"
        :class="{ 'text-white': isVisible, 'text-black': !isVisible }"
      >
      <h2 class="px-12 md:px-0 mb-12 lg:pr-24 text-[4rem] lg:text-[5rem] font-schnyder_wide_xl_webdemi">{{ titreDeLaSection }}</h2>
      <div class="mb-6 mt-[-2rem] pr-12 lg:pr-48 mt-4 pr-0 lg:pr-[12vw] 3xl:pr-[10rem] text-sm lato-light" v-html="contenu"></div>
    </div>

    <swiper
      :slides-per-view="2.9"
      :space-between="0"
      :loop="false"
      :navigation="{
        nextEl: '.swiper-button-next-portrait',
        prevEl: '.swiper-button-prev-portrait'
      }"
      @slideChange="onSlideChange"
      class="portrait-slider mx-4 "
    >
    
      <swiper-slide
        v-for="(post, index) in posts"
        :key="index"
        class="relative p-4"
      >
        <!-- Image -->
        <nuxtLink :to="'articles/' + post.slug || '#'" >
          <img
            :src="post.optionsArticles.imagePaysage?.node?.guid || ''"
            alt="Image slide"
            class="h-[21rem] w-full object-cover border border-white"
          />
        </nuxtLink>
        <!-- Text Content -->
        <div
          class="mt-3"
          :class="{
            'text-xl': currentIndex === index,
            'text-lg': currentIndex !== index,
            'text-white': isVisible,
            'text-black': !isVisible
          }"
        >
        <nuxtLink :to="'articles/' + post.slug || '#'" >
          <p class="mb-1 font-brandon_grotesquelight_italic uppercase text-xs z-9">{{ post.categories.edges[0]?.node.name || '' }}</p>
          <h3 class="text-base font-brandon_grotesquemedium uppercase">{{ post.title }}</h3>
        </nuxtLink>

        </div>
      </swiper-slide>
    </swiper>
    <div class="swiper-button-prev-portrait"></div>
    <div class="swiper-button-next-portrait"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import SwiperCore from 'swiper';
import { Navigation, Pagination, EffectFade } from 'swiper/modules';
SwiperCore.use([Navigation, Pagination, EffectFade]);
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
const currentIndex = ref(0);
const isVisible = ref(false);
const loading = ref(true);
const error = ref(null);

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
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const onSlideChange = (swiper) => {
  currentIndex.value = swiper.activeIndex % posts.value.length;
};

// IntersectionObserver
const blocPortrait = ref(null);
const handleIntersection = ([entry]) => {
  isVisible.value = entry.isIntersecting;
};

let observer;
fetchPosts();

onMounted(() => {
  fetchPosts();
  observer = new IntersectionObserver(handleIntersection, {
    threshold: 0.5,
  });
  if (blocPortrait.value) {
    observer.observe(blocPortrait.value);
  }
});

onUnmounted(() => {
  if (observer && blocPortrait.value) {
    observer.unobserve(blocPortrait.value);
  }
});
</script>


<style>
  .portrait-slider .swiper-slide{
    padding-top: 150px;
  }
  .portrait-slider .swiper-slide{
    height: 500px;
    transition: height 0.5s ease;
    transition: padding 0.5s ease;
  }
  .portrait-slider .swiper-slide-active {
    padding-top: 0;
    height: 650px;
    padding-left: 3rem;
    width: 50vw !important;
  }


  .swiper-slide-prev  .swiper-slid,
  .swiper-slide-next  .swiper-slid {
    width: calc((100vw - 30vw ) / 2) !important; /* 40px = 2 * spaceBetween */
  }
   .portrait-slider .swiper-slide-active img {
    height: 100%;
  }
  .portrait-slider .swiper-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: flex-end;
    align-content: flex-end;
    padding-bottom: 4rem;
  }
  .bloc-portrait .swiper-slide-next{
    margin-right: 0 !important;
  }
  .swiper-button-next-portrait,
  .swiper-button-prev-portrait {
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    top:var(--swiper-navigation-top-offset, 66%);
    position: absolute;
    margin-top: calc(0px - (var(--swiper-navigation-size) / 2));
    z-index: 10;
    cursor: pointer;
  }
  .swiper-button-next-portrait{
    right: var(--swiper-navigation-sides-offset, 10px);
    left: auto;
  }
  /* Changer l’icône de la flèche avec du texte ou un SVG perso */
  .swiper-button-next-portrait::after,
  .swiper-button-prev-portrait::after {
    font-size: 20px;
    font-weight: bold;
    color: #000;
    font-family: swiper-icons;
    text-transform: none !important;
    letter-spacing: 0;
    font-variant: initial;
    line-height: 1;
  }
  .swiper-button-next-portrait:after, .swiper-rtl .swiper-button-prev-portrait:after {
    content: 'next';
  }
  .swiper-button-prev-portrait:after, .swiper-rtl .swiper-button-next-portrait:after {
    content: 'prev';
  }
  .custom-pagination{
    bottom: var(--swiper-pagination-bottom, 8px);
      top: var(--swiper-pagination-top, auto);
      left: 0;
      width: 100%;
      position: absolute;
      text-align: center;
      transition: 300ms opacity;
      transform: translate3d(255, 255, 255);
      z-index: 10;
  }
  :deep(.custom-pagination .swiper-pagination-bullet) {
    background: rgba(255, 255, 255, 1) !important;
    transition: width 0.3s ease, background-color 0.3s ease;
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  :deep(.custom-pagination .swiper-pagination-bullet-active) {
    background: #000 !important;
    width: 25px;
    border-radius: 10px;
  }
  .swiper-button-lock, .swiper-button-disabled{
    display: none !important;
  }
</style>