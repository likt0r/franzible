<template>
	<v-img
		id="dropzone"
		:key="key"
		:src="
			preview ||
			(value && value.length > 0 ? getFullUrl(value[0]) : undefined)
		"
		:class="`cover-upload white--text align-end ${
			error ? ' error--text' : ''
		}`"
		gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
		aspect-ratio="1"
		contain
		:max-height="maxHeight"
		droppable
		@drop.prevent="onDrop($event)"
		@dragover.prevent="onDrag"
		@dragenter.prevent="onDragStart"
		@dragleave.prevent="onDragEnd"
	>
		<template v-slot:default>
			<v-overlay v-if="fileDrag" absolute :value="true">
				<v-icon v-if="fileDrag" large> mdi-upload</v-icon>
			</v-overlay>
			<v-card-title v-text="label"></v-card-title>
			<v-overlay
				v-if="preview"
				absolute
				:value="true"
				opacity="0"
				class="justify-end align-start"
			>
				<v-icon large @click="removeImage" style="pointer-events: auto"
					>mdi-close</v-icon
				>
			</v-overlay>
		</template>
		<template v-slot:placeholder>
			<v-overlay absolute :value="true" opacity="0">
				<v-icon @click="removeImage">mdi-book-open-variant</v-icon>
			</v-overlay>
		</template>
	</v-img>
</template>

<script>
import { getFullUrl } from '~/tools/url'
import { readLocalImage } from '~/tools/helper'
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
		error: {
			type: Boolean,
		},
	},
	data: () => {
		return {
			fileDrag: false,
			preview: null,
			coverUpload: null,
			key: 1,
		}
	},
	mounted() {},
	computed: {},

	methods: {
		getFullUrl,
		onDrag(event) {
			this.fileDrag = true
			// console.log('onDrag', event)
		},
		async onDrop(event) {
			this.preview = await readLocalImage(event.dataTransfer.files[0])
			this.coverUpload = event.dataTransfer.files[0]
			this.fileDrag = false
			this.$emit('cover-upload', this.preview)
		},
		onDragEnd(event) {
			console.log('onDragEnd', event)
			this.fileDrag = false
		},
		onDragStart(event) {
			console.log('onDragStart', event)
			this.fileDrag = true
		},
		removeImage(event) {
			this.preview = undefined
			this.coverUpload = null
			// workaround force rerendering, to prevent bug on not showing empty image
			this.key += 1
			this.$emit('cover-upload', null)
		},
	},
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
#dropzone * {
	pointer-events: none;
}
</style>
