<template>
	<div v-if="book">
		<v-container class="bottom-spacer">
			<v-form v-if="bookCopy" ref="form" fill-height>
				<v-row>
					<v-col cols="12" sm="6">
						<v-text-field
							v-model="bookCopy.title"
							label="Name"
							required
							:error="bookCopy.title !== book.title"
						></v-text-field>
						<v-text-field
							v-model="bookCopy.author"
							label="Author"
							required
							:error="bookCopy.author !== book.author"
						></v-text-field>
						<v-select
							v-model="bookCopy.type"
							:items="types.map((el) => el.value)"
							label="Type"
							required
							:error="bookCopy.type !== book.type"
						></v-select>
						<v-select
							v-model="bookCopy.language"
							:items="languages.map((el) => el.value)"
							label="Language"
							required
							:error="bookCopy.language !== book.language"
						></v-select>
						<v-select
							v-model="bookCopy.genre"
							:items="genres.map((el) => el.value)"
							label="Genre"
							required
							:error="bookCopy.genre !== book.genre"
						></v-select>
					</v-col>
					<v-col class="d-flex child-flex" cols="12" sm="6">
						<CoverUpload
							v-model="bookCopy.cover"
							label="Cover"
							:max-height="350"
							:error="coverChanged"
						/>
					</v-col>
				</v-row>
				<v-row>
					<v-col class="d-flex child-flex" cols="12">
						<TagCloud
							v-model="bookCopy.series"
							label="Series"
							addLabel="Series"
							:error="seriesChanged"
						/>
					</v-col>
					<v-col class="d-flex child-flex" cols="12">
						<FilesUploadTable
							v-model="bookCopy.files"
							label="Files"
							:error="true"
						/>
					</v-col>
				</v-row>
			</v-form>
		</v-container>
		<v-toolbar dense fixed dark>
			<v-btn
				color="success"
				class="mx-2"
				:disabled="!bookChanged"
				@click="save"
			>
				{{ verify ? 'Verify ' : 'Save Changes' }}
				<v-icon right> mdi-cloud-upload-outline </v-icon></v-btn
			>
			<v-btn
				color="warning"
				class="mx-2"
				@click="reset"
				:disabled="!bookChanged"
			>
				Reset Changes<v-icon right> mdi-backup-restore </v-icon>
			</v-btn>
			<v-spacer />
			<v-btn color="error" class="mx-2">
				Delete <v-icon right> mdi-trash-can-outline </v-icon></v-btn
			></v-toolbar
		>
	</div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import deepEqual from 'deep-equal'
import CoverUpload from '~/components/CoverUpload.vue'
import languages from '~/assets/languages'
import types from '~/assets/types'
import genres from '~/assets/genres'
import TagCloud from '~/components/TagCloud.vue'

export default {
	name: 'edit',
	components: {
		CoverUpload,
		TagCloud,
	},
	props: {
		bookId: {
			type: String,
			default: () => null,
		},
		verify: {
			type: Boolean,
			default: () => false,
		},
	},

	data() {
		return {
			sliderPosition: 0,
			sliederIsTouched: false,
			languages,
			types,
			genres,
			bookCopy: null,
			book: null,
		}
	},
	computed: {
		...mapGetters(['fileListState']),
		bookChanged() {
			return !deepEqual(this.book, this.bookCopy)
		},
		filesChanged() {
			return !deepEqual(
				this.book.files,
				this.bookCopy ? this.bookCopy.files : []
			)
		},
		seriesChanged() {
			return !deepEqual(this.book.series, this.bookCopy.series)
		},
		coverChanged() {
			return !deepEqual(this.book.cover, this.bookCopy.cover)
		},
	},
	watch: {
		async bookId(id) {
			console.log('BookId changed')
			this.book = await this.$store.dispatch('book/get', id)
			this.bookCopy = JSON.parse(JSON.stringify(this.book))
			if (this.verify) {
				this.bookCopy.verified = true
			}
		},
	},
	async mounted() {
		if (this.bookId) {
			this.book = await this.$store.dispatch('book/get', this.bookId)
			this.bookCopy = JSON.parse(JSON.stringify(this.book))
			if (this.verify) {
				this.bookCopy.verified = true
			}
		}
	},
	methods: {
		...mapActions('books', ['update']),
		reset() {
			this.bookCopy = JSON.parse(JSON.stringify(this.book))
			if (this.verify) {
				this.bookCopy.verified = true
			}
		},
		async save() {
			this.bookCopy.verified = true
			this.book = await this.$store.dispatch('book/patch', {
				id: this.bookId,
				doc: this.bookCopy,
			})
			this.$emit('verified', this.bookId)
			this.bookCopy = JSON.parse(JSON.stringify(this.book))
		},
	},
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
