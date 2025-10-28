<template>
    <div v-if="page">
      <h1>{{ page.title }}</h1>
      <div v-html="page.elementorContent || 'Contenu non disponible.'"></div>
    </div>
    <div v-else>
      Chargement...
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        page: null,
      };
    },
    async asyncData({ app, params }) {
      const { data } = await app.apolloProvider.defaultClient.query({
        query: gql`
          query GetPageWithElementorContent($id: ID!) {
            page(id: $id, idType: URI) {
              id
              title
              elementorContent
            }
          }
        `,
        variables: {
          id: params.slug,
        },
      });
      return {
        page: data.page,
      };
    },
  };
  </script>