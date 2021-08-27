<template>
	<v-img
		:alt="alt"
		:contain="contain"
		:eager="eager"
		:gradient="gradient"
		:lazy-src="lazySrc"
		:src="objectUrl || src"
		:options="options"
		:position="position"
		:sizes="sizes"
		:srcset="srcset"
		:transition="transition"
	>
		<template v-slot:default>
			<slot />
		</template>
		<template v-slot:placeholder>
			<v-icon large> mdi-book-open-variant</v-icon>
		</template>
	</v-img>
</template>
<script>
import { getDatabase } from '~/tools/database'
export default {
	props: {
		alt: String,
		contain: Boolean,
		eager: Boolean,
		gradient: String,
		lazySrc: String,
		dbId: Number,
		options: {
			type: Object,
			// For more information on types, navigate to:
			// https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
			default: () => ({
				root: undefined,
				rootMargin: undefined,
				threshold: undefined,
			}),
		},
		position: {
			type: String,
			default: () => 'center center',
		},
		sizes: String,
		src: {
			type: [String, Object],
			default: () => '',
		},
		srcset: String,
		transition: {
			type: [Boolean, String],
			default: () => 'fade-transition',
		},
	},
	data() {
		return {
			objectUrl: undefined,
			dbImageCreated: false,
		}
	},
	watch: {
		dbId() {
			this.setDatabaseImage()
		},
	},

	async beforeMount() {
		this.setDatabaseImage()
	},
	beforeDestroy() {
		if (this.objectUrl) {
			URL.revokeObjectURL(this.objectUrl)
		}
	},
	methods: {
		async setDatabaseImage() {
			if (this.objectUrl) {
				URL.revokeObjectURL(this.objectUrl)
			}
			if (this.dbId) {
				this.dbImageCreated = true
				this.objectUrl = await getDatabase().getFileContentUrl(this.dbId)
			}
		},
	},
}
</script>
<style scoped>
.v-chip {
	border-radius: 5px;
	font-size: 12px;
	height: 22px;
	margin-bottom: 4px;
}
.v-avatar {
	height: 72px !important;
	width: 72px !important;
	border-radius: unset;
	cursor: pointer;
}
.v-avatar .v-icon {
	align-self: flex-end;
}
.v-list-item-content {
	cursor: pointer;
}
</style>
