import { _ as __nuxt_component_0 } from './nuxt-link-gThAqNr3.mjs';
import { ref, computed, withAsyncContext, watchEffect, mergeProps, unref, withCtx, createTextVNode, toDisplayString, openBlock, createBlock, createVNode, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderComponent, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { b as useRoute, a as useRuntimeConfig } from './server.mjs';
import { u as useAsyncData } from './asyncData-COfFyXNC.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'pinia';
import 'vue-router';

const _sfc_main = {
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const config = useRuntimeConfig();
    const route = useRoute();
    const slug = route.params.slug;
    const limit = ref(10);
    const allPosts = ref([]);
    ref(null);
    const subcategories = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const childNodes = ((_c = (_b = (_a = data.value) == null ? undefined : _a.category) == null ? undefined : _b.children) == null ? undefined : _c.nodes) || [];
      const siblingNodes = ((_h = (_g = (_f = (_e = (_d = data.value) == null ? undefined : _d.category) == null ? undefined : _e.parent) == null ? undefined : _f.node) == null ? undefined : _g.children) == null ? undefined : _h.nodes) || [];
      const nodes = childNodes.length ? childNodes : siblingNodes;
      return nodes.filter((cat) => cat.count > 0);
    });
    const { data, error } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(`category-${slug}`, async () => {
      const res = await $fetch(config.public.wordpressUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
        query GetCategory($slug: ID!, $limit: Int!) {
          category(id: $slug, idType: SLUG) {
            name
            parent {
              node {
                id
                slug
                name
                children(first: 100) {
                  nodes {
                    name
                    slug
                    count
                  }
                }
              }
            }
            children(first: 100) {
              nodes {
                name
                slug
                count
              }
            }
            posts(first: $limit) {
              nodes {
                title
                slug
                featuredImage {
                  node {
                    sourceUrl
                    altText
                  }
                }
                excerpt
                optionsArticles {
                  champsLibrePageAccueil
                  imagePortait {
                    node {
                      sourceUrl
                      altText
                    }
                  }
                  imagePaysage {
                    node {
                      sourceUrl
                      altText
                    }
                  }
                }
              }
            }
          }
          allCategories: categories(first: 100) {
            nodes {
              name
              slug
            }
          }
        }
      `,
          variables: {
            slug,
            limit: limit.value
          }
        })
      });
      return res.data;
    }, { watch: [limit] })), __temp = await __temp, __restore(), __temp);
    watchEffect(() => {
      var _a, _b, _c;
      if ((_c = (_b = (_a = data.value) == null ? undefined : _a.category) == null ? undefined : _b.posts) == null ? undefined : _c.nodes) {
        allPosts.value = data.value.category.posts.nodes;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto py-10" }, _attrs))}><h1 class="text-6xl text-center mb-6 font-custom pb-10">${ssrInterpolate((_b = (_a = unref(data)) == null ? undefined : _a.category) == null ? undefined : _b.name)}</h1>`);
      if (unref(subcategories).length) {
        _push(`<div class="mb-8 pb-10 w-1/2 mx-auto"><ul class="flex flex-wrap align-center gap-3 justify-center"><!--[-->`);
        ssrRenderList(unref(subcategories), (child) => {
          _push(`<li class="mb-3">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/categories/" + child.slug,
            class: [
              "p-2 border border-black border-solid hover:text-white-600",
              child.slug === unref(route).params.slug ? "bg-black text-white" : ""
            ]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(child.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(child.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
      if (allPosts.value.length) {
        _push(`<ul class="grid grid-cols-1 sm:grid-cols-3 gap-8 auto-rows-auto"><!--[-->`);
        ssrRenderList(allPosts.value, (post, index) => {
          _push(`<li class="${ssrRenderClass([
            (index + 1) % 4 === 0 ? "sm:col-span-3 max-h-[600px]" : "sm:col-span-1",
            "w-full"
          ])}">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/articles/" + post.slug,
            class: "block group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a3;
              var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B;
              if (_push2) {
                if ((index + 1) % 4 === 0) {
                  _push2(`<div class="flex flex-col sm:flex-row gap-6 items-center"${_scopeId}><div class="w-full sm:w-2/3 max-h-[600px] overflow-hidden"${_scopeId}><img${ssrRenderAttr("src", ((_c = (_b2 = (_a2 = post.optionsArticles) == null ? undefined : _a2.imagePaysage) == null ? undefined : _b2.node) == null ? undefined : _c.sourceUrl) || ((_e = (_d = post.featuredImage) == null ? undefined : _d.node) == null ? undefined : _e.sourceUrl))}${ssrRenderAttr("alt", ((_g = (_f = post.featuredImage) == null ? undefined : _f.node) == null ? undefined : _g.altText) || post.title)} class="w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-110 rounded-lg max-h-[600px]"${_scopeId}></div><div class="w-full sm:w-1/3 flex flex-col jusctify-center"${_scopeId}><div class="text-xs uppercase italic text-gray-500 mb-1"${_scopeId}>Traiteur</div><h2 class="text-xl font-semibold mb-2"${_scopeId}>${ssrInterpolate(post.title)}</h2>`);
                  if (post.excerpt) {
                    _push2(`<p class="text-sm text-gray-700 mb-4"${_scopeId}>${(_a3 = post.excerpt) != null ? _a3 : ""}</p>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`<div${_scopeId}><span class="inline-block bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 transition"${_scopeId}>Lire l\u2019article</span></div></div></div>`);
                } else {
                  _push2(`<div${_scopeId}>`);
                  if ((_i = (_h = post.featuredImage) == null ? undefined : _h.node) == null ? undefined : _i.sourceUrl) {
                    _push2(`<div class="aspect-[3/4] overflow-hidden"${_scopeId}><img${ssrRenderAttr("src", (_k = (_j = post.optionsArticles) == null ? undefined : _j.imagePaysage) == null ? undefined : _k.node.sourceUrl)}${ssrRenderAttr("alt", ((_m = (_l = post.optionsArticles) == null ? undefined : _l.imagePaysage) == null ? undefined : _m.node.altText) || post.title)} class="w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-110 rounded-lg h-full"${_scopeId}></div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`<div class="mt-2 text-xs uppercase italic text-gray-500"${_scopeId}>${ssrInterpolate((_n = post.optionsArticles) == null ? undefined : _n.champsLibrePageAccueil)}</div><h2 class="text-sm font-medium leading-snug"${_scopeId}>${ssrInterpolate(post.title)}</h2></div>`);
                }
              } else {
                return [
                  (index + 1) % 4 === 0 ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "flex flex-col sm:flex-row gap-6 items-center"
                  }, [
                    createVNode("div", { class: "w-full sm:w-2/3 max-h-[600px] overflow-hidden" }, [
                      createVNode("img", {
                        src: ((_q = (_p = (_o = post.optionsArticles) == null ? undefined : _o.imagePaysage) == null ? undefined : _p.node) == null ? undefined : _q.sourceUrl) || ((_s = (_r = post.featuredImage) == null ? undefined : _r.node) == null ? undefined : _s.sourceUrl),
                        alt: ((_u = (_t = post.featuredImage) == null ? undefined : _t.node) == null ? undefined : _u.altText) || post.title,
                        class: "w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-110 rounded-lg max-h-[600px]"
                      }, null, 8, ["src", "alt"])
                    ]),
                    createVNode("div", { class: "w-full sm:w-1/3 flex flex-col jusctify-center" }, [
                      createVNode("div", { class: "text-xs uppercase italic text-gray-500 mb-1" }, "Traiteur"),
                      createVNode("h2", { class: "text-xl font-semibold mb-2" }, toDisplayString(post.title), 1),
                      post.excerpt ? (openBlock(), createBlock("p", {
                        key: 0,
                        class: "text-sm text-gray-700 mb-4",
                        innerHTML: post.excerpt
                      }, null, 8, ["innerHTML"])) : createCommentVNode("", true),
                      createVNode("div", null, [
                        createVNode("span", { class: "inline-block bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 transition" }, "Lire l\u2019article")
                      ])
                    ])
                  ])) : (openBlock(), createBlock("div", { key: 1 }, [
                    ((_w = (_v = post.featuredImage) == null ? undefined : _v.node) == null ? undefined : _w.sourceUrl) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "aspect-[3/4] overflow-hidden"
                    }, [
                      createVNode("img", {
                        src: (_y = (_x = post.optionsArticles) == null ? undefined : _x.imagePaysage) == null ? undefined : _y.node.sourceUrl,
                        alt: ((_A = (_z = post.optionsArticles) == null ? undefined : _z.imagePaysage) == null ? undefined : _A.node.altText) || post.title,
                        class: "w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-110 rounded-lg h-full"
                      }, null, 8, ["src", "alt"])
                    ])) : createCommentVNode("", true),
                    createVNode("div", { class: "mt-2 text-xs uppercase italic text-gray-500" }, toDisplayString((_B = post.optionsArticles) == null ? undefined : _B.champsLibrePageAccueil), 1),
                    createVNode("h2", { class: "text-sm font-medium leading-snug" }, toDisplayString(post.title), 1)
                  ]))
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</li>`);
        });
        _push(`<!--]--></ul>`);
      } else {
        _push(`<p>Aucun article pour cette cat\xE9gorie.</p>`);
      }
      _push(`<div class="h-10"></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/categories/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-GJB_2cgC.mjs.map
