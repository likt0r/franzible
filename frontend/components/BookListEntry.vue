<template>
	<v-list-item>
		<book-offline-controll :book="book" />
		<v-list-item-content @click.stop="gotoBook">
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
			<v-btn icon @click="playBook">
				<v-icon color="secondary">mdi-play</v-icon>
			</v-btn>
		</v-list-item-action>
	</v-list-item>
</template>
<script>
import OfflineImage from './OfflineImage.vue'
import BookOfflineControll from './BookOfflineControll.vue'
import { getInstance } from '~/tools/AudioPlayer'
import { getFullUrl } from '~/tools/url'
import { unlockAudio } from '~/tools/helper'
export default {
	components: { OfflineImage, BookOfflineControll },
	props: {
		book: {
			type: Object,
			default: () => {},
		},
	},
	data() {
		return {}
	},

	computed: {
		activeBookId() {
			return this.$store.getters['player/activeBookId']
		},
		bookId() {
			return this.book._id
		},
	},

	methods: {
		getFullUrl,
		gotoBook() {
			this.$router.push(`/books/${this.book._id}`)
		},

		async playBook() {
			if (this.activeBookId !== this.bookId) {
				const instance = await getInstance()
				await instance.initAudioElement()
				await this.$store.dispatch('book/get', this.book._id, {
					root: true,
				})
				if (!this.$store.getters['progress/getByBookId'](this.bookId)) {
					// progress does not exist create it
					await this.$store.dispatch(
						'progress/createByBookId',
						this.bookId
					)
				}

				const progress = this.$store.getters['progress/getByBookId'](
					this.bookId
				)

				await this.$store.dispatch('player/loadFile', {
					bookId: this.book._id,
					fileIndex: progress.fileIndex,
					filePosition: progress.filePosition,
					startPlaying: true,
				})
			} else if (this.playerIsPlaying || this.playerIsLoading) {
				this.$store.dispatch('player/pause')
			} else {
				this.$store.dispatch('player/resume')
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

.v-list-item__content {
	cursor: pointer !important;
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
