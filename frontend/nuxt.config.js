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
		middleware: ['initOffline', 'secured'],
	},

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [
		{ src: '~/plugins/feathers.js' },
		{ src: '~/plugins/authInit.js' },
		{ src: '~/plugins/vSnackbarQueue.js' },
		{ src: '~/plugins/vuex-persist', ssr: false },
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		'nuxt-client-init-module',
		'@nuxtjs/axios',
		'@nuxtjs/toast',
		'@nuxtjs/proxy',
	],

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/eslint
		'@nuxtjs/eslint-module',
		// https://go.nuxtjs.dev/vuetify
		'@nuxtjs/vuetify',
		'@nuxtjs/pwa',
	],
	axios: {
		baseURL: '/',
	},

	toast: {
		position: 'top-center',
		duration: 8000,
		keepOnHover: true,
		fullscreen: true,
		fitToScreen: true,
		iconPack: 'mdi',
		action: {
			icon: 'close-circle-outline',
			onClick: (e, toastObject) => {
				toastObject.goAway(0)
			},
		},
	},

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
	build: {},

	// PWA module configuration: https://go.nuxtjs.dev/pwa

	pwa: {
		workbox: {
			offlineStrategy: 'CacheFirst',
			offline: true,

			dev: process.env.NODE_ENV !== 'production',
		},
	},

	manifest: {
		short_name: 'Franzible',
		name: 'Franzible',
		start_url: '/',
		display: 'standalone',
		orientation: 'portrait',
		background_color: '#000',
		description: 'Franzible Zeit für Hörbücher',
		lang: 'de',
		theme_color: '#189AB4',
	},
	// Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
	vuetify: {
		customVariables: ['~/assets/variables.scss'],
		theme: {
			dark: true,
			themes: {
				dark: {
					primary: '#C0C1C1',
					accent: '#75E6DA',
					secondary: '#189AB4',
					info: colors.teal.lighten1,
					warning: colors.amber.base,
					error: colors.deepOrange.accent4,
					success: colors.green.accent3,
				},
			},
		},
	},

	server: {
		// port: 8000, // default: 3000
		host: '0.0.0.0', // default: localhost
	}, // other configs
}
