<template>
    <NuxtImg
        loading="lazy"
        format="webp"
        :src="block?.attributes?.src" 
        :alt="block?.attributes?.alt"
        :class="'h-screen w-full object-cover'" />
</template>

<script setup>
const props = defineProps({
    block: Object
})

</script>