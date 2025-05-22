<template>
  <div>
    <Header></Header>
    <div v-for="(bloc, index) in pageData?.template?.homepage?.blocs" :key="bloc.fieldGroupName + '_' + index">
      <component
        :is="getComponent(bloc.fieldGroupName)"
        v-bind="bloc"
      />
    </div>
    <Footer></Footer>
  </div>
</template>

<script setup>
  import ImageLayout from '/components/acf/ImageLayout.vue';
  import ContenuLayout from '/components/acf/ContenuLayout.vue';
  import GuideVoyageLayout from '/components/acf/GuideVoyageLayout.vue';
  import CarouselLayout from '/components/acf/CarouselLayout.vue';
  import GuideLayout from '/components/acf/GuideLayout.vue';
  import SliderLayout from '/components/acf/SliderLayout.vue';
  import PortraitLayout from '/components/acf/PortraitLayout.vue';

  const getComponent = (blocType) => {
    switch (blocType) {
      case 'HomepageBlocsImageLayout':
        return ImageLayout;
      case 'HomepageBlocsContenuLayout':
        return ContenuLayout;
      case 'HomepageBlocsGuideVoyageLayout':
        return GuideVoyageLayout;
      case 'HomepageBlocsCarouselLayout':
        return CarouselLayout;
      case 'HomepageBlocsGuideLayout':
        return GuideLayout;
      case 'HomepageBlocsSliderLayout':
        return SliderLayout;
      case 'HomepageBlocsPortraitLayout':
        return PortraitLayout;
      default:
        return null; 
    }
  };

  const config = useRuntimeConfig();

  const { data: settingsData } = await useFetch(config.public.wordpressUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetSiteSettings {
          allSettings {
            readingSettingsPageOnFront
          }
        }
      `,
    }),
    transform: (data) => data.data.allSettings,
  });

  const pageId = settingsData.value?.readingSettingsPageOnFront;

  const { data: pageData } = await useFetch(config.public.wordpressUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query GetHomePage($id: ID!) {
          page(id: $id, idType: DATABASE_ID) {
            template {
              ... on Template_HomePage {
                templateName
                homepage {
                  blocs {
                    fieldGroupName
                    ... on HomepageBlocsVideoLayout {
                      fieldGroupName
                      plateforme
                      video
                    }
                    ... on HomepageBlocsSliderLayout{
                      fieldGroupName
                      slider {
                        img {
                          node {
                            guid
                            link
                            slug
                          }
                        }
                        slug {
                          url
                          title
                        }
                        sousTitre
                        titre
                        headline
                        afficherDuTexte
                      }
                    }
                    ... on HomepageBlocsImageLayout {
                      fieldGroupName
                      image {
                        node {
                          sourceUrl(size: CAROUSEL_SIZE)
                          uri
                          srcSet(size: CAROUSEL_SIZE)
                          sizes(size: CAROUSEL_SIZE)
                          guid
                        }
                      }
                    }
                    ... on HomepageBlocsContenuLayout {
                      contenu
                      fieldGroupName
                    }
                    ... on HomepageBlocsCarouselLayout {
                      fieldGroupName
                      postParPage
                      headline
                      contenu
                      titreDeLaSection
                      categorie {
                        nodes {
                          slug
                        }
                      }
                    }
                    ... on HomepageBlocsPortraitLayout {
                      fieldGroupName
                      postParPage
                      headline
                      contenu
                      titreDeLaSection
                      categorie {
                        nodes {
                          slug
                        }
                      }
                    }
                    ... on HomepageBlocsGuideLayout {
                      fieldGroupName
                      categorie {
                        nodes {
                          slug
                        }
                      }
                      lien {
                        target
                        title
                        url
                      }
                    }
                    ... on HomepageBlocsGuideVoyageLayout {
                      fieldGroupName
                      postParPage
                      titreDeLaSection
                      categorie {
                        nodes {
                          slug
                        }
                      }
                    }
                    ... on HomepageBlocsShopLayout {
                      fieldGroupName
                      sousTitre
                      titreDeLaSection
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        id: pageId,
      },
    }),
    transform: (data) => data.data.page,
  });

  if (!pageData || pageData.length === 0) {
  console.error("Données introuvables");
}
  const page = pageData || null;
  const blocs = page?.acf?.blocs || [];
</script>