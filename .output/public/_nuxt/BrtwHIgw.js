import{_ as s}from"./DlAUqK2U.js";import{c as a,a as r,t as l,o as i}from"./CHXpqOc1.js";const c={data(){return{page:null}},async asyncData({app:t,params:n}){const{data:o}=await t.apolloProvider.defaultClient.query({query:gql`
          query GetPageWithElementorContent($id: ID!) {
            page(id: $id, idType: URI) {
              id
              title
              elementorContent
            }
          }
        `,variables:{id:n.slug}});return{page:o.page}}},p={key:0},_=["innerHTML"],d={key:1};function u(t,n,o,g,e,m){return e.page?(i(),a("div",p,[r("h1",null,l(e.page.title),1),r("div",{innerHTML:e.page.elementorContent||"Contenu non disponible."},null,8,_)])):(i(),a("div",d," Chargement... "))}const h=s(c,[["render",u]]);export{h as default};
