import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { useSSRContext } from 'vue';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = {
  data() {
    return {
      page: null
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
        id: params.slug
      }
    });
    return {
      page: data.page
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  if ($data.page) {
    _push(`<div${ssrRenderAttrs(_attrs)}><h1>${ssrInterpolate($data.page.title)}</h1><div>${$data.page.elementorContent || "Contenu non disponible."}</div></div>`);
  } else {
    _push(`<div${ssrRenderAttrs(_attrs)}> Chargement... </div>`);
  }
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/[...uri].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : undefined;
};
const ____uri_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { ____uri_ as default };
//# sourceMappingURL=_...uri_-CtuoJobJ.mjs.map
