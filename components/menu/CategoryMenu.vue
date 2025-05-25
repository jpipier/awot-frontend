<template>
  <div v-if="allPosts.length" class="mb-0 md:mb-10 pb-2 w-full md:w-1/2 mx-auto px-20 text-nowrap category-list">
    <!-- Desktop / Tablet: horizontal list -->
    <ul class="hidden lg:flex flex-wrap gap-3 justify-start category-list">
      <li v-for="child in allPosts" :key="child.slug">
        <NuxtLink
          :to="`/categories/${child.slug}`"
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
    <div class="lg:hidden">
      <select
        v-model="selectedSlug"
        @change="onSelectChange"
        class="w-full border border-gray-300 rounded p-2 text-xs uppercase"
      >
        <option disabled value="">Choisissez une catégorie</option>
        <option
          v-for="child in allPosts"
          :key="child.slug"
          :value="child.slug"
        >
          {{ child.name }}
        </option>
        <option select v-if="categorie === 'Voyages'" value="voyages">
          Toutes les destinations
        </option>
      </select>
    </div>
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
const router = useRouter();
const selectedSlug = ref(props.categorie === 'Voyages' ? 'voyages' : '');

function onSelectChange() {
  if (selectedSlug.value) {
    router.push(`/categories/${selectedSlug.value}`);
  }
}
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