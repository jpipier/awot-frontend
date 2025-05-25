<template>
  <div v-if="allPosts.length" class="mb-10 pb-2 w-1/2 mx-auto px-20 text-nowrap category-list">
    <ul class="flex flex-wrap align-left justify-left">
        <li v-for="child in allPosts" :key="child.slug" class="flex-nowrap">
        <NuxtLink
            :to="'/categories/' + child.slug"
            class="lato-light text-xs uppercase"
        >
            {{ child.name }}
        </NuxtLink>
        </li>
        <li v-if="categorie === 'Voyages'">
        <NuxtLink
            to="/categories/voyages" 
            class="lato-light text-xs uppercase"
        >
            Toutes les destinations
        </NuxtLink>
        </li>
    </ul>
  </div>
</template>

<script setup>
  import { useRoute, useAsyncData, useRuntimeConfig } from '#imports';
  import { ref, watchEffect, onMounted } from 'vue';
 
const props = defineProps({
  slug: {
    type: String,
    required: true
  }
})

  const config = useRuntimeConfig();
  const route = useRoute();
  const slug = route.params.slug;
  
  const limit = ref(10);
  const allPosts = ref([]);
  const sentinel = ref(null);
  const categorie = ref();


  const { data, error } = await useAsyncData(`category-${slug}`, async () => {
  const res = await $fetch(config.public.wordpressUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetCategory {
            categories(first: 100, where: {name: "voyages"}) {
                nodes {
                    name
                    children(first: 100, where: {hideEmpty: true}) {
                        nodes {
                            name
                            slug
                        }
                    }
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
    categorie.value = data.value.categories.nodes[0].name;
    if (data.value?.categories?.nodes[0]?.children?.nodes) {
      allPosts.value = data.value.categories.nodes[0].children.nodes;
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

<style scoped>
.category-list li::after {
  content: "\00a0|\00a0";
  font-family: "Lato", sans-serif;
  font-weight: 300;
  font-style: normal; ;}
  .category-list li:last-child:after {
      content: "";

  }
</style>