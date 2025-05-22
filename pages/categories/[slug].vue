<template>
    <div class="container mx-auto py-10">
      <h1 class="text-6xl text-center mb-6 font-custom pb-10">{{ data?.category?.name }}</h1>
      <div v-if="subcategories.length" class="mb-8 pb-10 w-1/2 mx-auto">
        <ul class="flex flex-wrap align-center gap-3 justify-center">
          <li v-for="child in subcategories" :key="child.slug" class="mb-3">
            <NuxtLink
              :to="'/categories/' + child.slug"
              :class="[
                'p-2 border border-black border-solid hover:text-white-600',
                child.slug === route.params.slug ? 'bg-black text-white' : ''
              ]"
            >
              {{ child.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>
      <ul v-if="allPosts.length" class="grid grid-cols-1 sm:grid-cols-3 gap-8 auto-rows-auto">
        <li
          v-for="(post, index) in allPosts"
          :key="post.slug"
          :class="[
            ((index + 1) % 4 === 0) ? 'sm:col-span-3 max-h-[600px]' : 'sm:col-span-1',
            'w-full'
        ]"
        >
          <NuxtLink :to="'/articles/' + post.slug" class="block group">
            <div v-if="(index + 1) % 4 === 0" class="flex flex-col sm:flex-row gap-6 items-center">
              <div class="w-full sm:w-2/3 max-h-[600px] overflow-hidden">
                <img
                  :src="post.optionsArticles?.imagePaysage?.node?.sourceUrl || post.featuredImage?.node?.sourceUrl"
                  :alt="post.featuredImage?.node?.altText || post.title"
                  class="w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-110 rounded-lg max-h-[600px]"
                />
              </div>
              <div class="w-full sm:w-1/3 flex flex-col jusctify-center">
                <div class="text-xs uppercase italic text-gray-500 mb-1">Traiteur</div>
                <h2 class="text-xl font-semibold mb-2">{{ post.title }}</h2>
                <p class="text-sm text-gray-700 mb-4" v-if="post.excerpt" v-html="post.excerpt"></p>
                <div>
                  <span class="inline-block bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 transition">Lire l’article</span>
                </div>
              </div>
            </div>
            <div v-else>
              <div v-if="post.featuredImage?.node?.sourceUrl" class="aspect-[3/4] overflow-hidden">
                <img
                  :src="post.optionsArticles?.imagePaysage?.node.sourceUrl"
                  :alt="post.optionsArticles?.imagePaysage?.node.altText || post.title"
                  class="w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-110 rounded-lg h-full"
                />
              </div>
              <div class="mt-2 text-xs uppercase italic text-gray-500">{{ post.optionsArticles?.champsLibrePageAccueil }}</div>
              <h2 class="text-sm font-medium leading-snug">{{ post.title }}</h2>
            </div>
          </NuxtLink>
        </li>
      </ul>
      <p v-else>Aucun article pour cette catégorie.</p>
      <div ref="sentinel" class="h-10"></div>
    </div>
  </template>
  
  <script setup>
  import { useRoute, useAsyncData, useRuntimeConfig } from '#imports';
  import { ref, watchEffect, onMounted } from 'vue';
  
  const config = useRuntimeConfig();
  const route = useRoute();
  const slug = route.params.slug;
  
  const limit = ref(10);
  const allPosts = ref([]);
  const sentinel = ref(null);
  
const subcategories = computed(() => {
  const childNodes = data.value?.category?.children?.nodes || [];
  const siblingNodes = data.value?.category?.parent?.node?.children?.nodes || [];

  const nodes = childNodes.length ? childNodes : siblingNodes;

  // Filtre : uniquement celles avec postCount > 0
  return nodes.filter(cat => cat.count > 0);
});

  const { data, error } = await useAsyncData(`category-${slug}`, async () => {
  const res = await $fetch(config.public.wordpressUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetCategory($slug: ID!, $limit: Int!) {
          category(id: $slug, idType: SLUG) {
            name
            parent {
              node {
                id
                slug
                name
                children(first: 100) {
                  nodes {
                    name
                    slug
                    count
                  }
                }
              }
            }
            children(first: 100) {
              nodes {
                name
                slug
                count
              }
            }
            posts(first: $limit) {
              nodes {
                title
                slug
                featuredImage {
                  node {
                    sourceUrl
                    altText
                  }
                }
                excerpt
                optionsArticles {
                  champsLibrePageAccueil
                  imagePortait {
                    node {
                      sourceUrl
                      altText
                    }
                  }
                  imagePaysage {
                    node {
                      sourceUrl
                      altText
                    }
                  }
                }
              }
            }
          }
          allCategories: categories(first: 100) {
            nodes {
              name
              slug
            }
          }
        }
      `,
      variables: {
        slug,
        limit: limit.value,
      },
    }),
  });
  return res.data;
}, { watch: [limit] });
  
  watchEffect(() => {
    if (data.value?.category?.posts?.nodes) {
      allPosts.value = data.value.category.posts.nodes;
    }
  });
  
  onMounted(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        limit.value += 10;
      }
    });
    if (sentinel.value) observer.observe(sentinel.value);
  });
  </script>