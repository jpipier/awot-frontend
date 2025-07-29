<template>
  <Header></Header>
  <div class="article-container font-brandon_grotesquelight elementor-23965">
    <div v-if="loading" class="text-center py-10">Chargement en cours...</div>
    <div v-else-if="error" class="text-center text-red-500 py-10">
      Erreur : {{ error }}
    </div>
    <div v-else>
      <section class="contentElementor elementor-section elementor-top-section elementor-element elementor-element-40717a53 elementor-section-full_width elementor-section-items-top elementor-section-content-top elementor-section-height-min-height elementor-section-stretched elementor-section-height-default" data-id="40717a53" data-element_type="section" id="sticky-anchor" data-settings="{&quot;stretch_section&quot;:&quot;section-stretched&quot;}">
        <div class="elementor-container elementor-column-gap-no">
          <div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-5386998d" data-id="5386998d" data-element_type="column" id="sticky1">
            <div class="elementor-widget-wrap elementor-element-populated">
              <div class="elementor-element elementor-element-4825aef0 elementor-widget elementor-widget-image" data-id="4825aef0" data-element_type="widget" data-widget_type="image.default">
                <div class="elementor-widget-container">
                  <img 
                    loading="lazy" 
                    :src="post.optionsArticles?.imagePortait?.node?.guid" 
                    class="attachment-2048x2048 size-2048x2048 wp-image-25683" 
                    :alt="post.title" 
                    :srcset="post.optionsArticles?.imagePortait?.node?.srcSet" 
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-55e1937d main-content" data-id="55e1937d" data-element_type="column" id="stickyTitle">
            <div class="elementor-widget-wrap elementor-element-populated">
                <div class="elementor-element elementor-element-1beb8e7 elementor-align-center elementor-widget__width-initial elementor-widget elementor-widget-post-info" data-id="1beb8e7" data-element_type="widget" data-widget_type="post-info.default">
                  <div class="elementor-widget-container">
                    <ul class="elementor-inline-items elementor-icon-list-items elementor-post-info">
                      <li class="elementor-icon-list-item elementor-repeater-item-4926042 elementor-inline-item">
                          <span class="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-custom">Flâner | Le guide</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="elementor-element elementor-element-2db9eee5 elementor-widget-tablet_extra__width-initial elementor-widget__width-initial elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="2db9eee5" data-element_type="widget" data-widget_type="theme-post-title.default">
                  <div class="elementor-widget-container">
                    <h1 class="elementor-heading-title elementor-size-small">{{post.title}}</h1>				
                  </div>
                </div>
              </div>
            </div>
            <div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-4cb8ff8" data-id="4cb8ff8" data-element_type="column">
              <div class="elementor-widget-wrap"></div>
            </div>
          </div>
          <div v-html="post.elementorContent"></div>
		  </section>
    </div>
  </div>
  <PostFooter />
  
  <Footer></Footer>

</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useRuntimeConfig } from '#app'
import PostFooter from '/components/footer/PostFooter.vue'

const config = useRuntimeConfig()
const route = useRoute()

const slug = route.params.uri?.join('/')

const { data: post, pending: loading, error } = await useAsyncData('fetchPost', async () => {
  const response = await fetch(config.public.wordpressUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query GetPostBySlug($slug: String!) {
          postBy(slug: $slug) {
            title
            content
            elementorContent
            optionsArticles {
              champsLibre
              champsLibrePageAccueil
              imagePortait {
                node {
                  guid
                }
              }
            }
          }
        }
      `,
      variables: { slug },
    }),
  })

  if (!response.ok) throw new Error('Erreur lors de la récupération de l\'article')
  const result = await response.json()
  return result.data?.postBy || {}
})

const loadElementorCSS = async () => {
  try {
    const response = await fetch(`${config.public.wordpressApi}/elementor/v1/css-files`)
    const cssFiles = await response.json()

    if (Array.isArray(cssFiles)) {
      cssFiles.forEach((fileUrl) => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = fileUrl
        document.head.appendChild(link)
      })
    }
  } catch (err) {
    console.error('Erreur lors du chargement des fichiers CSS Elementor :', err)
  }
}

onMounted(() => {
  loadElementorCSS()
})

</script>

<style scope>
.elementor-23965 .elementor-element.elementor-element-2db9eee5{
  max-width: 100% !important;
}
</style>