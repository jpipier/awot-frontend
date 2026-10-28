import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/styles/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      borderRadius: {
        xxl: '3rem'
      },
      height: {
        590: '34vw'
      },
      fontFamily: {
        schnyderCondensed: ['schnyder_condensed_xl_light', 'serif'],
        custom: ['schnyder_xl_weblight', 'sans-serif'],
        montserrat: ['brandon_grotesquelight', 'sans-serif'],
        brandonLight: ['brandon_grotesquelight', 'sans-serif'],
        brandonRegular: ['brandon_grotesqueregular', 'sans-serif'],
        brandonMedium: ['brandon_grotesquemedium', 'sans-serif'],
        lato: ['var(--font-lato)', 'sans-serif']
      }
    }
  },
  plugins: []
}

export default config
