<template>
	<book-editor :book-id="bookId"></book-editor>
</template>

<script>
import BookEditor from '~/components/BookEditor.vue'

export default {
	name: 'edit',
	components: {
		BookEditor,
	},

	layout: 'default',
	transition: 'slide-left',

	async asyncData({ params, store }) {
		const bookId = params.id

		return { bookId }
	},

	computed: {},
	watch: {},
	mounted() {},
	methods: {},
}
</script>
<style>
.bottom-spacer {
	padding-bottom: 82px;
	padding-top: 82px;
}

.v-toolbar {
	position: fixed;
	bottom: 0px;
	left: 0;
	right: 0;
}
.v-application .error--text,
.tag-cloud.error--text .v-card__title,
.cover-upload.v-image.error--text,
.cover-upload.v-image.error--text .v-card__title,
.v-application .v-input.error--text,
.v-application .v-label.error--text,
.v-application .v-icon.error--text {
	color: #ffc107 !important;
	caret-color: #ffc107 !important;
	border-color: #ffc107 !important;
}

.cover-upload.v-image.error--text {
	border: 2px solid !important;
}
</style>
