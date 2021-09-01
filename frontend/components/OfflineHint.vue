<template>
	<v-container>
		<v-card class="mx-auto my-12" max-width="374" elevation="0">
			<v-img
				height="250"
				contain
				src="/offline-internet.svg"
				class="offline-hint"
			></v-img>

			<v-card-title class="justify-center">
				No connection to Server</v-card-title
			>
			<v-card-text class="justify-center">
				Please check your internet connection
			</v-card-text>
		</v-card>
	</v-container>
</template>
<script>
export default {
	name: 'OfflineHint',
	components: {},
	computed: {},
}
</script>
<style scoped>
.v-card {
	background-color: transparent;
}
</style>
