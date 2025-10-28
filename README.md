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
```

Server-only fallbacks (`WORDPRESS_GQL`, `WORDPRESS_API`, `WORDPRESS_URL`) are also supported if you prefer not to expose the endpoints publicly.

## Available Scripts

- `npm run dev` – start the Next.js dev server
- `npm run lint` – run ESLint with Next.js rules
- `npm run build` – create a production build (validated during migration)
- `npm start` – serve the production build

## Legacy Nuxt code

All legacy Vue/Nuxt files were moved to `legacy-nuxt/`. They are excluded from the build but can be consulted if you need to compare implementations.
