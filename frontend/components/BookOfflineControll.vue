<template>
	<v-list-item-avatar tile>
		<v-container class="layer">
			<offline-image
				:alt="`${book.title} cover image`"
				:dbId="this.book && book.coverDbId"
				:src="this.book.cover ? getFullUrl(this.book.cover) : undefined"
			>
			</offline-image>
		</v-container>
		<v-container class="layer">
			<v-progress-circular
				v-if="active"
				class="activation_outer"
				rotate="-90"
				size="62"
				width="1"
				indeterminate
				color="accent"
			>
			</v-progress-circular>
		</v-container>
		<v-container class="layer">
			<v-progress-circular
				v-if="active"
				class="activation_inner"
				rotate="-45"
				size="40"
				width="1"
				indeterminate
				color="accent"
			>
			</v-progress-circular>
		</v-container>
		<v-container class="layer">
			<v-progress-circular
				v-if="
					isBookBeingDownloaded(book._id) ||
					getBookOfflineState(book._id) === BOOK_OFFLINE_STATE.partial
				"
				:rotate="-90"
				:size="60"
				:width="10"
				:value="getBookDownloadProgress(book._id)"
				color="secondary"
			>
				<v-btn
					v-if="!isBookBeingDeleted(book._id)"
					class=""
					fab
					large
					color="transparent"
					@click.stop="toggleDownload"
				>
					<v-icon color="secondary">
						{{
							isBookBeingDownloaded(book._id) ? 'mdi-pause' : 'mdi-play'
						}}</v-icon
					>
				</v-btn>
				<v-icon v-else color="primary"> mdi-delete </v-icon>
			</v-progress-circular>
		</v-container>

		<v-container class="layer bar">
			<v-icon
				v-if="getBookOfflineState(book._id) === BOOK_OFFLINE_STATE.notStarted"
				small
				@click.stop="startDownload"
				>{{ 'mdi-download' }}</v-icon
			>

			<v-dialog
				v-model="dialog"
				width="500"
				v-if="
					getBookOfflineState(book._id) !== BOOK_OFFLINE_STATE.notStarted &&
					!isBookBeingDownloaded(book._id) &&
					!isBookBeingDeleted(book._id)
				"
			>
				<template v-slot:activator="{ on, attrs }">
					<v-icon small v-bind="attrs" v-on="on">{{ 'mdi-delete' }}</v-icon>
				</template>

				<v-card>
					<v-card-title> Delete {{ book.title }} </v-card-title>

					<v-card-text>
						Do you really want to delete {{ book.title }} from your offline
						storage ?
					</v-card-text>

					<v-divider></v-divider>

					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="secondary darken-1" text @click="dialog = false">
							Close
						</v-btn>
						<v-btn
							color="secondary"
							text
							@click="
								dialog = false
								deleteBook()
							"
						>
							Delete
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-container>
	</v-list-item-avatar>
</template>
<script>
import { mapGetters } from 'vuex'
import OfflineImage from './OfflineImage.vue'
import { getFullUrl } from '~/tools/url'
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
			dialog: false,
			coverUrl: '/icon.png',
			BOOK_OFFLINE_STATE,
		}
	},

	computed: {
		...mapGetters({
			getBookOfflineState: 'offline/getBookOfflineState',
			getOfflineBook: 'offline/getBook',
			getBookDownloadProgress: 'offline/getBookDownloadProgress',
			isBookBeingDownloaded: 'offline/isBookBeingDownloaded',
			isBookBeingDeleted: 'offline/isBookBeingDeleted',
		}),
		active() {
			return (
				this.isBookBeingDownloaded(this.book._id) ||
				this.isBookBeingDeleted(this.book._id)
			)
		},
	},

	methods: {
		getFullUrl,

		toggleDownload() {
			console.log('Book clicked ', this.getBookOfflineState(this.book._id))

			if (this.isBookBeingDownloaded(this.book._id)) {
				this.$store.dispatch('offline/pauseDownload', this.book._id)
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
.v-avatar {
	height: 72px !important;
	width: 72px !important;
	border-radius: unset;
	display: block !important;
	background-color: rgb(19, 32, 42);
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
	pointer-events: none;
}

.layer button {
	pointer-events: all;
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
.v-progress-circular {
	margin-top: 6px;
	margin-left: 6px;
}
.v-progress-circular.activation_outer {
	margin-top: 5px;
	margin-left: 5px;
}
.v-progress-circular.activation_inner {
	margin-top: 16px;
	margin-left: 16px;
}
</style>
