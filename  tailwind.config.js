module.exports = {
    content: [
      './components/**/*.{vue,js}',
      './layouts/**/*.vue',
      './pages/**/*.vue',
      './composables/**/*.{js,ts}',
      './app.vue',
    ],
    theme: {
      extend: {
        height: {
          '590': '34vw',
        },
        fontFamily: {
          custom: ['schnyder_xl_weblight', 'sans-serif'],
          montserrat: ["Montserrat", "sans-serif"],
          brandonLight: ["brandon_light", "sans-serif"],
        },
      },
    },
};