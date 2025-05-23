import { _ as __nuxt_component_0, a as __nuxt_component_1 } from './footer-GDMYG6Rr.mjs';
import { withAsyncContext, unref, useSSRContext, ref, computed, mergeProps } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
import { a as useRuntimeConfig } from './server.mjs';
import { u as useAsyncData } from './asyncData-COfFyXNC.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import './nuxt-link-gThAqNr3.mjs';
import 'lodash';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import 'pinia';

const staticText = "D\xE9couvrez d\u2019autres ";
const _sfc_main$1 = {
  __name: "PostFooter",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const words = ["restaurants", "h\xF4tels", "coffee shops", "boutiques", "sorties"];
    const currentIndex = ref(0);
    const config = useRuntimeConfig();
    const { data: postsData, error, pending } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("getPosts", async () => {
      const response = await fetch(config.public.wordpressUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
          query GetPosts {
            posts(first: 20) {
              nodes {
                id
                title
                slug
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
              }
            }
          }
        `
        })
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la r\xE9cup\xE9ration des articles");
      }
      const result = await response.json();
      return result.data.posts.nodes;
    })), __temp = await __temp, __restore(), __temp);
    const numberOfPosts = ref(5);
    const randomPosts = computed(() => {
      if (!postsData.value || !Array.isArray(postsData.value)) return [];
      const posts = postsData.value.slice();
      for (let i = posts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [posts[i], posts[j]] = [posts[j], posts[i]];
      }
      return posts.slice(0, numberOfPosts.value);
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(pending)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "loading" }, _attrs))}>Chargement...</div>`);
      } else if (unref(error)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "error" }, _attrs))}>Erreur : ${ssrInterpolate(unref(error).message)}</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "removeSticky elementor-element-27be2e8c elementor-posts--thumbnail-top elementor-widget elementor-widget-posts" }, _attrs))}><h2 class="cd-headline wordrotate font-custom text-4xl flex flex-row px-[2rem] mt-10"><div class="pr-[10px] flex-none">${ssrInterpolate(staticText)}</div><div class="cd-words-wrapper font-schnyder_xl_webdemi flex-grow"><!--[-->`);
        ssrRenderList(words, (word, index) => {
          _push(`<span class="${ssrRenderClass({
            "is-visible": index === currentIndex.value,
            "is-hidden": index !== currentIndex.value
          })}">${ssrInterpolate(word)}</span>`);
        });
        _push(`<!--]--></div></h2><div class="elementor-widget-container"><div class="elementor-posts-container elementor-posts elementor-posts--skin-classic grid gap-8 elementor-has-item-ratio px-[2rem] grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5"><!--[-->`);
        ssrRenderList(randomPosts.value, (post) => {
          var _a2;
          var _a, _b;
          _push(`<article class="elementor-post elementor-grid-item post-{{ post.id }} post type-post status-publish format-standard has-post-thumbnail hentry"><a class="elementor-post__thumbnail__link"${ssrRenderAttr("href", `/articles/${post.slug}/`)}><div class="elementor-post__thumbnail overflow-hidden relative"><img loading="lazy" width="640" height="959" class="rounded-md shadow-lg object-cover w-full h-full hover:scale-110 transition-transform duration-300"${ssrRenderAttr("src", (_b = (_a = post.featuredImage) == null ? undefined : _a.node) == null ? undefined : _b.sourceUrl)}${ssrRenderAttr("alt", post.title)}></div></a><div class="elementor-post__text font-lato"><a${ssrRenderAttr("href", `/articles/${post.slug}/`)}>${(_a2 = post.title) != null ? _a2 : ""}</a></div></article>`);
        });
        _push(`<!--]--></div></div></div>`);
      }
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/footer/PostFooter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : undefined;
};
const _sfc_main = {
  __name: "[...uri]",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const config = useRuntimeConfig();
    const route = useRoute();
    const slug = (_a = route.params.uri) == null ? undefined : _a.join("/");
    const { data: post, pending: loading, error } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData("fetchPost", async () => {
      var _a2;
      const response = await fetch(config.public.wordpressUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          variables: { slug }
        })
      });
      if (!response.ok) throw new Error("Erreur lors de la r\xE9cup\xE9ration de l'article");
      const result = await response.json();
      return ((_a2 = result.data) == null ? undefined : _a2.postBy) || {};
    })), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a3;
      var _a2, _b, _c, _d, _e, _f;
      const _component_Header = __nuxt_component_0;
      const _component_Footer = __nuxt_component_1;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_Header, null, null, _parent));
      _push(`<div class="article-container font-brandon_grotesquelight elementor-23965">`);
      if (unref(loading)) {
        _push(`<div class="text-center py-10">Chargement en cours...</div>`);
      } else if (unref(error)) {
        _push(`<div class="text-center text-red-500 py-10"> Erreur : ${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<div><section class="contentElementor elementor-section elementor-top-section elementor-element elementor-element-40717a53 elementor-section-full_width elementor-section-items-top elementor-section-content-top elementor-section-height-min-height elementor-section-stretched elementor-section-height-default" data-id="40717a53" data-element_type="section" id="sticky-anchor" data-settings="{&quot;stretch_section&quot;:&quot;section-stretched&quot;}"><div class="elementor-container elementor-column-gap-no"><div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-5386998d" data-id="5386998d" data-element_type="column" id="sticky1"><div class="elementor-widget-wrap elementor-element-populated"><div class="elementor-element elementor-element-4825aef0 elementor-widget elementor-widget-image" data-id="4825aef0" data-element_type="widget" data-widget_type="image.default"><div class="elementor-widget-container"><img loading="lazy"${ssrRenderAttr("src", (_c = (_b = (_a2 = unref(post).optionsArticles) == null ? undefined : _a2.imagePortait) == null ? undefined : _b.node) == null ? undefined : _c.guid)} class="attachment-2048x2048 size-2048x2048 wp-image-25683"${ssrRenderAttr("alt", unref(post).title)}${ssrRenderAttr("srcset", (_f = (_e = (_d = unref(post).optionsArticles) == null ? undefined : _d.imagePortait) == null ? undefined : _e.node) == null ? undefined : _f.srcSet)}></div></div></div></div><div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-55e1937d main-content" data-id="55e1937d" data-element_type="column" id="stickyTitle"><div class="elementor-widget-wrap elementor-element-populated"><div class="elementor-element elementor-element-1beb8e7 elementor-align-center elementor-widget__width-initial elementor-widget elementor-widget-post-info" data-id="1beb8e7" data-element_type="widget" data-widget_type="post-info.default"><div class="elementor-widget-container"><ul class="elementor-inline-items elementor-icon-list-items elementor-post-info"><li class="elementor-icon-list-item elementor-repeater-item-4926042 elementor-inline-item"><span class="elementor-icon-list-text elementor-post-info__item elementor-post-info__item--type-custom">Fl\xE2ner | Le guide</span></li></ul></div></div><div class="elementor-element elementor-element-2db9eee5 elementor-widget-tablet_extra__width-initial elementor-widget__width-initial elementor-widget elementor-widget-theme-post-title elementor-page-title elementor-widget-heading" data-id="2db9eee5" data-element_type="widget" data-widget_type="theme-post-title.default"><div class="elementor-widget-container"><h1 class="elementor-heading-title elementor-size-small">${ssrInterpolate(unref(post).title)}</h1></div></div></div></div><div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-4cb8ff8" data-id="4cb8ff8" data-element_type="column"><div class="elementor-widget-wrap"></div></div></div><div>${(_a3 = unref(post).elementorContent) != null ? _a3 : ""}</div></section></div>`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_sfc_main$1, null, null, _parent));
      _push(ssrRenderComponent(_component_Footer, null, null, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/articles/[...uri].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined;
};

export { _sfc_main as default };
//# sourceMappingURL=_...uri_-B4-nFLFm.mjs.map
