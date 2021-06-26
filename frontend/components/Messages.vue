<template>
	<v-snackbar-queue
		:items="items"
		top
		right
		@remove="hideMessage"
		closeButtonIcon="mdi-close"
	></v-snackbar-queue>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
	computed: {
		...mapGetters({
			items: 'messages/items',
		}),
	},

	methods: {
		hideMessage(id) {
			this.$store.dispatch('messages/hideMessage', id)
		},
	},
}
</script>
