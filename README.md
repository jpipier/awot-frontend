# Nuxt 3 WordPress Starter

This project is meant to be a flexible starting point for people interested in using [Nuxt 3](https://nuxt.com/) with WordPress as a headless CMS. If you want some additional resources to help get you started, check out the blog post and video linked below.

[✍️ Read the step-by-step tutorial](https://wpengine.com/builders/headless-wordpress-with-nuxt-3-vue-3/)
[📹 Watch the video]()

## Requirements
- [WordPress](https://wordpress.org/)
- [WPGraphQL](https://www.wpgraphql.com/docs/introduction)
- Environment Variables

Update the `wordpressUrl` variable in `nuxt.config.ts` to your WordPress site and run `npm run dev`:

```
export default defineNuxtConfig({
    modules: [
        '@nuxt/devtools',
        '@nuxtjs/tailwindcss' 
    ],
    runtimeConfig: {
        public: {
            wordpressUrl: 'https://yourwordpresssite/graphql'
        }
    }
})
