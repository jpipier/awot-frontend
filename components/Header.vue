<template>
    
  <!-- Bouton Loupe -->
  <button
    @click="toggleSearch"
    class="z-50 fixed top-4 right-14 flex items-center justify-center w-10 h-10"
    :aria-label="(isMenuOpen || isSearchOpen) ? 'Fermer la recherche' : 'Ouvrir la recherche'"
  >
    <svg xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         stroke-width="1.5"
         stroke="currentColor"
         class="w-6 h-6 text-black">
      <path stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
    </svg>
  </button>

  <!-- Bouton Burger -->
  <button
    @click="toggleMenu"
    class="z-50 fixed top-4 right-4 flex flex-col justify-center items-center w-10 h-10 group"
    :aria-label="(isMenuOpen || isSearchOpen) ? 'Fermer le menu' : 'Ouvrir le menu'"
  >
    <span :class="['block w-6 h-0.5 bg-black transition duration-300',
      (isMenuOpen || isSearchOpen) ? 'rotate-45 translate-y-1.5' : '']" />
    <span :class="['block w-6 h-0.5 bg-black my-1 transition-opacity duration-300',
      (isMenuOpen || isSearchOpen) ? 'opacity-0' : 'opacity-100']" />
    <span :class="['block w-6 h-0.5 bg-black transition duration-300',
      (isMenuOpen || isSearchOpen) ? '-rotate-45 -translate-y-1.5' : '']" />
  </button>

  <!-- Menu plein écran -->
  <transition name="fade">
    <div
      v-if="isMenuOpen"
      class="fixed inset-0 bg-white z-40 flex items-center justify-center"
    >
      <HeaderMenu />
    </div>
  </transition>

  <!-- Modale de recherche -->
  <transition name="fade">
    <div
      v-if="isSearchOpen"
      class="fixed inset-0 bg-white z-40 flex items-center justify-center flex-col"
    >
      <h4 class="text-[50pt] font-custom">Rechercher...</h4>
      <div class="w-full max-w-md p-4">
        <Search />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue' ;
import HeaderMenu from '~/components/menu/HeaderMenu.vue';
import Search from '~/components/Search.vue';


const isMenuOpen = ref(false)
const isSearchOpen = ref(false)

function toggleMenu() {
  if (isSearchOpen.value) {
    isSearchOpen.value = false 
  } else {
    isMenuOpen.value = !isMenuOpen.value 
  }
}

function toggleSearch() {
  isMenuOpen.value = false
  isSearchOpen.value = !isSearchOpen.value
}

// Bloque le scroll si une modale est ouverte
watch([isMenuOpen, isSearchOpen], ([menu, search]) => {
  const body = document.body
  if (menu || search) {
    body.classList.add('overflow-hidden')
  } else {
    body.classList.remove('overflow-hidden')
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>