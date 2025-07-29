<template>
    <footer class="bg-black text-white py-5 mt-10 relative after:w-full after:h-[80px] after:bg-white after:absolute after:top-0 after:z-0 overflow-hidden">
      <div class="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 px-6">
        <div class="flex flex-col space-y-2 text-left uppercase pt-20 text-sm elementor-23971">
          <FooterMenu />
        </div>
  
        <div class="flex flex-col items-center text-center my-5">
          <h2 class="text-[40pt] lg:text-[60pt] font-custom pt-10 lg:pt-20">{{ settingsStore.siteTitle }}</h2>
          <p class="text-[8pt] mt-2 uppercase lato-light">
            {{ settingsStore.siteDescription }}
          </p>
        </div>
  
        <div class="relative flex flex-col items-center lg:items-end text-right space-y-3 h-full">
          <div class="relative w-44 lg:w-56 h-48">
            <img class="absolute left-0 w-full z-10 clip-bottom" :src="image30" alt="Nous">
          </div>
          <div class="relative w-44 lg:w-56">
            <p class="text-xs italic absolute left-[-10rem]">C’EST NOUS !</p>
          </div>
          <div class="flex space-x-0 mt-2">
            <img class="w-5" :src="trac6" alt="Icon Instagram">
            <img class="w-5" :src="trac7" alt="Icon Email">
          </div>
        </div>
  
      </div>
      <EditBanner v-if="showEditBanner" :post-id="postId" />

    </footer>

  </template>
  

<script setup>
  import image30 from '@/assets/img/image-30-1x-png@1x.png';
  import trac6 from '@/assets/img/trac--6@1x.png';
  import trac7 from '@/assets/img/trac--7@1x.png';
  import { useSiteSettings } from '~/stores/siteSettings';
  import FooterMenu from '~/components/menu/FooterMenu.vue';
  import EditBanner from '~/components/admin/EditBanner.vue';

  const { data } = await useFetch('/api/wp-session')
  const showEditBanner = computed(() => data.value?.loggedIn && data.value?.user?.roles.includes('administrator'))
  const settingsStore = useSiteSettings()

  onMounted(() => {
    settingsStore.fetchSiteSettings()
  });
</script>
  
<style scoped>
  .clip-bottom {
    clip-path: inset(0 0 38% 0);
  }
</style>