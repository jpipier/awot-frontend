<template>
  <div>
    <NuxtPage :transition="pageTransition" />
  </div>
</template>
<script setup>
useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap'
    }
  ]
})
const pageTransition = {
  name: 'fade',
  mode: 'out-in'
}
</script>


<style>
/* Slide de droite à gauche */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
  position: absolute;
  width: 100%;
}

.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>