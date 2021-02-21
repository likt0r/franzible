import colors from 'vuetify/es5/util/colors'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - Franzible',
    title: 'Franzible',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],
  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  env: {
    API_URL: '/api',
    API_SOCKET: '/',
  },
  router: {
    middleware: ['feathers'],
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/feathers-vuex.js' },
    { src: '~/plugins/authInit.js' },
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    // https://go.nuxtjs.dev/pwa
    // '@nuxtjs/pwa',
    '@nuxtjs/proxy',
    'nuxt-client-init-module',
  ],

  proxy: {
    // Simple proxy
    '/api.socket.io': {
      target:
        process.env.NODE_ENV === 'production'
          ? 'http://api:80/socket.io'
          : 'http://localhost:3030/socket.io',
      changeOrigin: false, // for vhosted sites, changes host header to match to target's host
      ws: true, // enable websocket proxy
      // logLevel: 'debug',
    },
    '/api': {
      target:
        process.env.NODE_ENV === 'production'
          ? 'http://api:80/'
          : 'http://localhost:3030',
      pathRewrite: { '^/api/': '' },
      // changeOrigin: true, // for vhosted sites, changes host header to match to target's host
      ws: false, // enable websocket proxy
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: ['feathers-vuex'],
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  // pwa: {
  //   manifest: {
  //     lang: 'en',
  //   },
  // },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },
}
