<template>
	<v-img
		:src="value && value.length > 0 ? getFullUrl(value[0]) : ''"
		class="white--text align-end"
		gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
		aspect-ratio="1"
		contain
		:max-height="maxHeight"
	>
		<template v-slot:default>
			<v-card-title v-text="label"></v-card-title>
		</template>
		<template v-slot:placeholder>
			<v-overlay absolute :value="true">
				<v-icon large> mdi-book-open-variant</v-icon>
			</v-overlay>
		</template>
	</v-img>
</template>

<script>
import { getFullUrl } from '~/tools/url'
export default {
	props: {
		value: {
			type: Array,
			default: () => [],
		},
		label: {
			type: String,
		},
		maxHeight: {
			type: Number,
		},
	},
	data: () => {
		return {}
	},
	computed: {},

	methods: { getFullUrl },
}
</script>
<style scoped>
.v-card__title {
	letter-spacing: normal;
	color: rgb(133, 133, 133);
	font-size: 16px;
	line-height: 20px;
	font-family: 'Roboto', sans-serif;
}
</style>
