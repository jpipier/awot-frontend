import{_ as G}from"./qgjIc2bd.js";import{p as H,r as w,h as R,g as z,q as J,e as K,c as s,a as t,t as _,i as h,F as B,j as D,s as k,o as a,b as M,w as O,n as E,d as Q,k as W}from"./Bl7iyr1J.js";import{u as X}from"./StCM4XRx.js";const Y={class:"container mx-auto py-10"},Z={class:"text-6xl text-center mb-6 font-custom pb-10"},ee={key:0,class:"mb-8 pb-10 w-1/2 mx-auto"},te={class:"flex flex-wrap align-center gap-3 justify-center"},se={key:1,class:"grid grid-cols-1 sm:grid-cols-3 gap-8 auto-rows-auto"},ae={key:0,class:"flex flex-col sm:flex-row gap-6 items-center"},oe={class:"w-full sm:w-2/3 max-h-[600px] overflow-hidden"},le=["src","alt"],re={class:"w-full sm:w-1/3 flex flex-col jusctify-center"},ne={class:"text-xl font-semibold mb-2"},ce=["innerHTML"],ie={key:1},ue={key:0,class:"aspect-[3/4] overflow-hidden"},de=["src","alt"],ge={class:"mt-2 text-xs uppercase italic text-gray-500"},me={class:"text-sm font-medium leading-snug"},pe={key:2},ve={__name:"[slug]",async setup(_e){let f,T;const F=W(),A=H(),P=A.params.slug,y=w(10),v=w([]),b=w(null),U=R(()=>{var c,i,e,u,d,g,m,p;const l=((e=(i=(c=n.value)==null?void 0:c.category)==null?void 0:i.children)==null?void 0:e.nodes)||[],o=((p=(m=(g=(d=(u=n.value)==null?void 0:u.category)==null?void 0:d.parent)==null?void 0:g.node)==null?void 0:m.children)==null?void 0:p.nodes)||[];return(l.length?l:o).filter(x=>x.count>0)}),{data:n,error:fe}=([f,T]=z(async()=>X(`category-${P}`,async()=>(await $fetch(F.public.wordpressUrl,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:`
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
      `,variables:{slug:P,limit:y.value}})})).data,{watch:[y]})),f=await f,T(),f);return J(()=>{var l,o,r;(r=(o=(l=n.value)==null?void 0:l.category)==null?void 0:o.posts)!=null&&r.nodes&&(v.value=n.value.category.posts.nodes)}),K(()=>{const l=new IntersectionObserver(o=>{o[0].isIntersecting&&(y.value+=10)});b.value&&l.observe(b.value)}),(l,o)=>{var c,i;const r=G;return a(),s("div",Y,[t("h1",Z,_((i=(c=h(n))==null?void 0:c.category)==null?void 0:i.name),1),h(U).length?(a(),s("div",ee,[t("ul",te,[(a(!0),s(B,null,D(h(U),e=>(a(),s("li",{key:e.slug,class:"mb-3"},[M(r,{to:"/categories/"+e.slug,class:E(["p-2 border border-black border-solid hover:text-white-600",e.slug===h(A).params.slug?"bg-black text-white":""])},{default:O(()=>[Q(_(e.name),1)]),_:2},1032,["to","class"])]))),128))])])):k("",!0),v.value.length?(a(),s("ul",se,[(a(!0),s(B,null,D(v.value,(e,u)=>(a(),s("li",{key:e.slug,class:E([(u+1)%4===0?"sm:col-span-3 max-h-[600px]":"sm:col-span-1","w-full"])},[M(r,{to:"/articles/"+e.slug,class:"block group"},{default:O(()=>{var d,g,m,p,x,C,I,L,N,j,$,S,V,q;return[(u+1)%4===0?(a(),s("div",ae,[t("div",oe,[t("img",{src:((m=(g=(d=e.optionsArticles)==null?void 0:d.imagePaysage)==null?void 0:g.node)==null?void 0:m.sourceUrl)||((x=(p=e.featuredImage)==null?void 0:p.node)==null?void 0:x.sourceUrl),alt:((I=(C=e.featuredImage)==null?void 0:C.node)==null?void 0:I.altText)||e.title,class:"w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-110 rounded-lg max-h-[600px]"},null,8,le)]),t("div",re,[o[0]||(o[0]=t("div",{class:"text-xs uppercase italic text-gray-500 mb-1"},"Traiteur",-1)),t("h2",ne,_(e.title),1),e.excerpt?(a(),s("p",{key:0,class:"text-sm text-gray-700 mb-4",innerHTML:e.excerpt},null,8,ce)):k("",!0),o[1]||(o[1]=t("div",null,[t("span",{class:"inline-block bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 transition"},"Lire l’article")],-1))])])):(a(),s("div",ie,[(N=(L=e.featuredImage)==null?void 0:L.node)!=null&&N.sourceUrl?(a(),s("div",ue,[t("img",{src:($=(j=e.optionsArticles)==null?void 0:j.imagePaysage)==null?void 0:$.node.sourceUrl,alt:((V=(S=e.optionsArticles)==null?void 0:S.imagePaysage)==null?void 0:V.node.altText)||e.title,class:"w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-110 rounded-lg h-full"},null,8,de)])):k("",!0),t("div",ge,_((q=e.optionsArticles)==null?void 0:q.champsLibrePageAccueil),1),t("h2",me,_(e.title),1)]))]}),_:2},1032,["to"])],2))),128))])):(a(),s("p",pe,"Aucun article pour cette catégorie.")),t("div",{ref_key:"sentinel",ref:b,class:"h-10"},null,512)])}}};export{ve as default};
