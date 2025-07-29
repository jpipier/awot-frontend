<template>
    <div class="h-screen ">
        {{ props?.image?.node?.guid }}
        <NuxtImg
          loading="lazy"
          format="webp"
          :src="props?.image?.node?.guid" 
          :alt="'test'"
          :class="'h-screen w-full object-cover'" />
    </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useFetch } from '#app';


const config = useRuntimeConfig();

const props = defineProps({
  titreDeLaSection: String,
  image: Object,
});

</script>