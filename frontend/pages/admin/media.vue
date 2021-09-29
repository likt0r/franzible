<template>
	<v-container>
		<v-card fixed>
			<v-card-title class="justify-center">Media Managment</v-card-title>
			<v-card-actions class="justify-center">
				<v-btn color="secondary" @click="startUpdate">
					<v-progress-circular
						v-if="updating"
						:value="progress"
						class="mr-2"
						rotate="-90"
					></v-progress-circular
					>{{ updating ? 'updating' : 'Update Media' }}
				</v-btn>
			</v-card-actions>

			<v-tabs
				v-model="tab"
				dark
				fixed-tabs
				next-icon="mdi-arrow-right-bold-box-outline"
				prev-icon="mdi-arrow-left-bold-box-outline"
				show-arrows
			>
				<v-tab v-for="({ _id, title }, index) in books" :key="_id">
					{{ title + index }}
				</v-tab>
			</v-tabs>
		</v-card>
		<v-tabs-items v-model="tab">
			<v-tab-item v-for="{ _id, title } in books" :key="_id">
				<book-editor
					:book-id="_id"
					v-on:verified="verified"
					:verify="true"
				/>
			</v-tab-item>
		</v-tabs-items>
	</v-container>
</template>

<script>
import { getFullUrl } from '~/tools/url'

export default {
	components: {},
	layout: 'default',
	middleware: 'admin',

	data: () => {
		return {
			books: null,
			loading: false,
			tab: null,
		}
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
		verified(id) {
			this.books = this.books.filter((book) => book._id !== id)
			console.log(id)
		},
	},
	async mounted() {
		this.loading = true
		this.books = await this.$feathers.service('books').find({
			query: {
				verified: { $ne: true },
				$select: ['_id', 'title'],
			},
		})
		this.loading = false
	},
}
</script>
<style>
.v-card {
	position: sticky;
	z-index: 2;
	top: 0px;
	left: 0;
	right: 0;
}
</style>
