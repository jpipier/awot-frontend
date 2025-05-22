<template>
  <NuxtLink :to="post.uri">
    <div
      class="flex 
      flex-col
      items-start 
      bg-gradient-to-r
      from-cyan-500 
      to-blue-500 
      p-8 
      rounded-lg 
      text-white 
      transition-all 
      hover:-translate-y-1 
      hover:scale-105"
    >
      <div>
        <h2 class="font-semibold text-2xl">{{ post.title }}</h2>
        <p>{{ new Date(post.date).toLocaleDateString() }}</p>
      </div>
      <ul class="mt-4">
        <li v-for="category in post.categories" :key="category.slug">
          <span class="bg-white text-cyan-500 px-2 py-1 rounded">{{ category.name }}</span>
        </li>
      </ul>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  post: Record<'title' | 'date' | 'excerpt' | 'uri', string> & {
    categories: Array<{ name: string; slug: string }>;
  };
}>();
</script>