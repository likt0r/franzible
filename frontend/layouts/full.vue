<template>
	<v-app dark>
		<messages />
		<v-main>
			<nuxt />
		</v-main>
	</v-app>
</template>

<script>
import Messages from '~/components/Messages.vue'
export default {
	components: { Messages },
	data() {
		return {
			clipped: false,
			drawer: false,
			fixed: false,
			items: [
				{
					icon: 'mdi-apps',
					title: 'Welcome',
					to: '/',
				},
				{
					icon: 'mdi-chart-bubble',
					title: 'Inspire',
					to: '/inspire',
				},
			],
			miniVariant: false,
			right: true,
			title: 'Vuetify.js',
		}
	},
}
</script>
