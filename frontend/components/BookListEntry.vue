<template>
	<v-list-item>
		<v-list-item-avatar tile>
			<v-container class="layer">
				<offline-image
					:alt="`${book.title} cover image`"
					:src="getFullUrl(this.book.cover)"
					:dbId="this.book && book.coverDbId"
				>
				</offline-image>
			</v-container>

			<v-container class="layer">
				<v-progress-circular
					v-if="
						isBookDownloading(book._id) ||
						getBookOfflineState(book._id) === BOOK_OFFLINE_STATE.partial
					"
					:rotate="-90"
					:size="72"
					:width="10"
					:value="getBookDownloadProgress(book._id)"
					color="secondary"
				>
					<v-btn class="" fab small color="transparent">
						<v-icon color="secondary">
							{{
								isBookDownloading(book._id) ? 'mdi-pause' : 'mdi-play'
							}}</v-icon
						>
					</v-btn>
				</v-progress-circular>
			</v-container>

			<v-container class="layer bar">
				<v-icon
					v-if="getBookOfflineState(book._id) === BOOK_OFFLINE_STATE.notStarted"
					small
					@click.stop="startDownload"
					>{{ 'mdi-download' }}</v-icon
				>

				<v-icon
					v-if="
						getBookOfflineState(book._id) !== BOOK_OFFLINE_STATE.notStarted &&
						!isBookDownloading(book._id)
					"
					small
					@click.stop="deleteBook"
					>{{ 'mdi-delete' }}</v-icon
				>
			</v-container>
		</v-list-item-avatar>

		<v-list-item-content>
			<v-list-item-title v-if="book.series.length > 0"
				><v-chip
					v-for="serie in book.series"
					:key="serie"
					class="mr-2"
					color="#13202a"
					small
				>
					{{ serie }}
				</v-chip></v-list-item-title
			>
			<v-list-item-title v-text="book.title"></v-list-item-title>
			<v-list-item-subtitle v-text="book.author"></v-list-item-subtitle>
		</v-list-item-content>

		<v-list-item-action>
			<v-btn icon :to="`/books/${book._id}`">
				<v-icon color="secondary">mdi-play</v-icon>
			</v-btn>
		</v-list-item-action>
	</v-list-item>
</template>
<script>
import { mapGetters } from 'vuex'
import OfflineImage from './OfflineImage.vue'
import { getFullUrl } from '~/tools/url'
import { getDatabase } from '~/tools/database'
import { BOOK_OFFLINE_STATE } from '~/tools/consts'
export default {
	components: { OfflineImage },
	props: {
		book: {
			type: Object,
			default: () => {},
		},
	},
	data() {
		return {
			coverUrl: '/icon.png',
			BOOK_OFFLINE_STATE,
		}
	},

	computed: {
		...mapGetters({
			getBookOfflineState: 'offline/getBookOfflineState',
			getOfflineBook: 'offline/getBook',
			getBookDownloadProgress: 'offline/getBookDownloadProgress',
			isBookDownloading: 'offline/isBookDownloading',
		}),
	},

	methods: {
		getFullUrl,

		toggleDownload() {
			console.log('Book clicked ', this.getBookOfflineState(this.book._id))

			if (this.isBookDownloading(this.book._id)) {
				console.log('offline/pauseDowload')
			} else {
				console.log('offline/addBook')
				this.$store.dispatch('offline/addBook', this.book._id)
			}
		},
		startDownload() {
			this.$store.dispatch('offline/addBook', this.book._id)
		},
		deleteBook() {
			this.$store.dispatch('offline/deleteBook', this.book._id)
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
	display: block !important;
}
.layer {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	height: 72px !important;
	width: 72px !important;
	padding: 0;
	display: flex;
}
/* .v-progress-circular__info .v-icon::before {
	right: 7px !important;
} */

.v-avatar .v-icon {
	align-self: flex-end;
}
.v-list-item-content {
	cursor: pointer;
}
/* .bar .v-icon.mdi::before {
	position: absolute;
	top: 2px;
	right: 2px;
} */
.bar button {
	position: absolute;
	top: 0;
	right: 0;
	height: auto;
	width: auto;
}
</style>
