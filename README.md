# Next.js WordPress Frontend

This application now runs on [Next.js 14](https://nextjs.org/) with the App Router. WordPress (WPGraphQL + REST) remains the headless CMS. The previous Nuxt implementation is preserved under `legacy-nuxt/` for reference only.

## Getting Started

```bash
npm install
npm run dev
```

The development server is available at [http://localhost:3000](http://localhost:3000).

### Environment variables

The project expects the following variables (see `.env` for concrete values):

```env
NEXT_PUBLIC_WORDPRESS_GQL=https://<your-site>/wp/graphql
NEXT_PUBLIC_WORDPRESS_API=https://<your-site>/wp-json
NEXT_PUBLIC_WORDPRESS_URL=https://<your-site>/
WORDPRESS_PREVIEW_SECRET=<optional-shared-secret>
# Optional (headless SEO)
NEXT_PUBLIC_SITE_URL=https://<your-frontend-domain>
YOAST_SYNC_CANONICAL=false
YOAST_SYNC_ROBOTS=false
# Optional (Matomo analytics)
NEXT_PUBLIC_MATOMO_URL=https://analytics.example.com/
NEXT_PUBLIC_MATOMO_SITE_ID=1
NEXT_PUBLIC_MATOMO_DISABLE_COOKIES=false
```

Server-only fallbacks (`WORDPRESS_GQL`, `WORDPRESS_API`, `WORDPRESS_URL`) are also supported if you prefer not to expose the endpoints publicly.

When Yoast SEO is enabled in WordPress, the frontend consumes `yoast_head_json` to build page metadata (title/description/Open Graph/Twitter).  
For headless setups, canonical and robots are disabled by default to avoid propagating backend-domain canonicals or accidental `noindex`; enable them explicitly with `YOAST_SYNC_CANONICAL=true` and/or `YOAST_SYNC_ROBOTS=true` if desired.

### WordPress preview (BO -> headless)

The frontend now supports WordPress preview URLs and redirects them to headless preview mode:

- Incoming links like `?preview=true&p=<id>` are intercepted by middleware.
- `GET /api/preview` enables Next.js draft mode and redirects to `/articles/preview/<id>`.
- The article route then fetches the preview revision via WPGraphQL (`asPreview: true`).

If you set `WORDPRESS_PREVIEW_SECRET`, append `secret=<same-value>` to the preview URL generated in WordPress for extra protection.

### Instagram feed

The component `InstagramFeed` fetches media from the Instagram Basic Display API. To enable it:

1. Generate a long-lived access token for the Instagram account (see Meta’s documentation) and store it in `INSTAGRAM_ACCESS_TOKEN`.
2. Optionally set `INSTAGRAM_USER_ID` if the token does not resolve to the desired user (otherwise the API defaults to `me`).
3. If you are using a Facebook Page / Business token (values that usually start with `EAA`), set `INSTAGRAM_GRAPH_HOST=graph.facebook.com`. Basic Display tokens (they start with `IG…`) automatically use `graph.instagram.com`, so no change is needed in that case.
4. Import the component where you need it in the App Router:

```tsx
import InstagramFeed from '@/components/social/InstagramFeed'

export default function HomePage() {
  return (
    <main>
      {/* Other sections */}
      <InstagramFeed limit={6} />
    </main>
  )
}
```

The component renders on the server, so the token remains private. Results are cached for 10 minutes by default.

Set `INSTAGRAM_DEBUG=true` to surface API error details in the UI when the feed cannot be fetched (useful in staging only).

The UI itself is powered by Meta’s oEmbed Read API, so also provide `INSTAGRAM_OEMBED_TOKEN` (app-id|client-token pair) if you prefer not to reuse the long-lived Instagram token.

#### Instagram oEmbed helper

`GET /api/oembed/instagram?url=<instagram_post_url>` proxies the official oEmbed endpoint (v17.0) so the access token remains on the server. Configure `INSTAGRAM_OEMBED_TOKEN` (or reuse `INSTAGRAM_ACCESS_TOKEN`) and, if needed, tweak parameters:

```
/api/oembed/instagram?url=https://www.instagram.com/p/abc123/&maxwidth=540&hidecaption=true
```

The response mirrors Meta’s JSON payload and is cached on the server for 10 minutes.

### Matomo analytics

When `NEXT_PUBLIC_MATOMO_URL` and `NEXT_PUBLIC_MATOMO_SITE_ID` are configured, the frontend displays an analytics consent banner and only loads Matomo after acceptance.

If you want a cookieless Matomo setup, also set:

```
NEXT_PUBLIC_MATOMO_DISABLE_COOKIES=true
```

## Available Scripts

- `npm run dev` – start the Next.js dev server
- `npm run lint` – run ESLint with Next.js rules
- `npm run build` – create a production build (validated during migration)
- `npm start` – serve the production build

## Legacy Nuxt code

All legacy Vue/Nuxt files were moved to `legacy-nuxt/`. They are excluded from the build but can be consulted if you need to compare implementations.
