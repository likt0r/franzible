<template>
	<v-container>
		<v-btn :loading="updating" block color="secondary" @click="startUpdate">
			Update Media
		</v-btn>
		<v-progress-linear v-if="updating" :value="progress"></v-progress-linear>
	</v-container>
</template>

<script>
import { getFullUrl } from '~/tools/url'

export default {
	layout: 'default',
	middleware: 'admin',

	data: () => {
		return {}
	},

	watch: {},
	computed: {
		updating() {
			return this.$store.getters['media/updating']
		},
		progress() {
			return this.$store.getters['media/progress']
		},
	},
	methods: {
		startUpdate() {
			if (!this.updating) {
				this.$store.dispatch('media/updateMedia')
			}
		},
	},
}
</script>
