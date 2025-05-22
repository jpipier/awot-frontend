<template>
    <div v-if="pending" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">Erreur : {{ error.message }}</div>
    <div v-else class="removeSticky elementor-element-27be2e8c elementor-posts--thumbnail-top elementor-widget elementor-widget-posts">
      <h2 class="cd-headline wordrotate font-custom text-4xl flex flex-row px-[2rem] mt-10">
        <div class="pr-[10px] flex-none">{{ staticText }}</div>
        <div class="cd-words-wrapper font-schnyder_xl_webdemi flex-grow">
          <span
            v-for="(word, index) in words"
            :key="index"
            :class="{
              'is-visible': index === currentIndex,
              'is-hidden': index !== currentIndex
            }"
          >
            {{ word }}
          </span>
        </div>
      </h2>
      <div class="elementor-widget-container">
<div class="elementor-posts-container elementor-posts elementor-posts--skin-classic grid gap-8 elementor-has-item-ratio px-[2rem]
  grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          <article
            v-for="post in randomPosts"
            :key="post.id"
            class="elementor-post elementor-grid-item post-{{ post.id }} post type-post status-publish format-standard has-post-thumbnail hentry"
          >
            <a class="elementor-post__thumbnail__link" :href="`/articles/${post.slug}/`">
              <div class="elementor-post__thumbnail overflow-hidden relative">
                <img
                  loading="lazy"
                  width="640"
                  height="959"
                  class="rounded-md shadow-lg object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                  :src="post.featuredImage?.node?.sourceUrl"
                  :alt="post.title"
                />
              </div>
            </a>
            <div class="elementor-post__text font-lato">
              <a :href="`/articles/${post.slug}/`" v-html="post.title" />            </div>
          </article>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useRuntimeConfig } from '#app';
  import { ref, onMounted, onUnmounted } from 'vue'

    const staticText = 'Découvrez d’autres '
    const words = ['restaurants', 'hôtels', 'coffee shops', 'boutiques', 'sorties']
    const currentIndex = ref(0)

    let interval

    onMounted(() => {
      interval = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % words.length
      }, 2500)
    })

    onUnmounted(() => {
      clearInterval(interval)
    })
  
    const config = useRuntimeConfig();
    const { data: postsData, error, pending } = await useAsyncData('getPosts', async () => {
    const response = await fetch(config.public.wordpressUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query GetPosts {
            posts(first: 20) {
              nodes {
                id
                title
                slug
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
              }
            }
          }
        `
      })
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des articles');
    }
    const result = await response.json();
    return result.data.posts.nodes;
  });

  const numberOfPosts = ref(5)
const updatePostCount = () => {
  const width = window.innerWidth
  if (width < 640) {
    numberOfPosts.value = 3
  } else if (width < 1024) {
    numberOfPosts.value = 4 
  } else {
    numberOfPosts.value = 5
  }
}
 const randomPosts = computed(() => {
    if (!postsData.value || !Array.isArray(postsData.value)) return []
    const posts = postsData.value.slice()
    for (let i = posts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[posts[i], posts[j]] = [posts[j], posts[i]]
    }
    return posts.slice(0, numberOfPosts.value)
  })
  onMounted(() => {
    updatePostCount()
    window.addEventListener('resize', updatePostCount)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', updatePostCount)
  })
  </script>
  <style>

 
  .cd-words-wrapper{
    position: relative;
  }
  .cd-headline.wordrotate span {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transform: rotateX(180deg);
    transform-origin: 50% 100%;
    transition: all 1s ease;
  }

  .cd-headline.wordrotate span.is-visible {
    position: absolute;
    opacity: 1;
    transform: rotateX(0deg);
  }
  </style>