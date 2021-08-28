<template>
	<v-app-bar
		v-if="lastBookId"
		bottom
		fixed
		dark
		height="86"
		style="cursor: pointer"
		@click.stop="gotoBook()"
	>
		<v-avatar shrink>
			<offline-image
				:src="bookCoverUrl"
				:db-id="book && book.coverDbId"
				contain
			></offline-image>
		</v-avatar>
		<div class="mid-column ml-2">
			<marquee-text
				class="font-weight-medium title"
				:repeat="1"
				:paused="true"
				>{{ title }}</marquee-text
			>
			<marquee-text
				class="font-weight-light subtitle"
				:repeat="1"
				:paused="true"
				>{{
					`${toMinutesAndSeconds(bookRemainingTime)} verbleibend`
				}}</marquee-text
			>
		</div>
		<v-btn icon shrink @click.stop="fastRewind">
			<v-icon class="" large>mdi-rewind-30</v-icon>
		</v-btn>
		<v-btn class="ml-0 mr-0" icon shrink @click.stop="playButtonClick">
			<v-progress-circular
				v-if="playerIsLoading"
				:rotate="-90"
				:size="40"
				:width="2"
				:indeterminate="true"
			>
				<v-icon>{{
					playerIsPlaying || playerIsLoading ? 'mdi-pause' : 'mdi-play'
				}}</v-icon>
			</v-progress-circular>
			<v-icon v-else>{{
				playerIsPlaying || playerIsLoading ? 'mdi-pause' : 'mdi-play'
			}}</v-icon>
		</v-btn>
	</v-app-bar>
</template>

<script>
import MarqueeText from 'vue-marquee-text-component'
import OfflineImage from './OfflineImage.vue'
import { getFullUrl } from '~/tools/url'
import { toMinutesAndSeconds } from '~/tools/formatTime'
export default {
	name: 'SmallPlayer',
	components: {
		MarqueeText,
		OfflineImage,
	},
	mixins: [],
	data() {
		return {}
	},
	computed: {
		title() {
			return `${this.book ? this.book.title : ''} | ${
				this.book ? this.book.author : ''
			}`
		},
		author() {
			return '53min 43s verbleibend'
		},

		playerBookId() {
			return this.$store.getters['player/activeBookId']
		},
		lastProgress() {
			const bookId = this.$store.getters['progress/lastPlayedBookId']
			console.log('SmallPlayer lastProgress id', bookId)
			const book = bookId
				? this.$store.getters['progress/getByBookId'](
						this.$store.getters['progress/lastPlayedBookId']
				  )
				: null
			console.log('SmallPlayer lastProgress book', book)
			return book
		},
		lastBookId() {
			return this.$store.getters['progress/lastPlayedBookId']
		},
		book() {
			return this.$store.getters['progress/lastPlayedBookId']
				? this.$store.getters['book/getBook'](
						this.$store.getters['progress/lastPlayedBookId']
				  )
				: null
		},

		bookCoverUrl() {
			return (
				this.book &&
				this.book.cover &&
				this.book.cover[0] &&
				getFullUrl(this.book.cover[0])
			)
		},

		bookDuration() {
			return this.book
				? this.book.files.reduce((acc, file) => acc + file.duration, 0)
				: 0
		},
		tillChapter() {
			if (this.lastProgress && this.book) {
				let tillChapter = 0
				for (let i = 0; i < this.lastProgress.fileIndex; i++)
					tillChapter += this.book.files[i].duration
				return tillChapter
			} else {
				return 0
			}
		},
		bookRemainingTime() {
			return (
				this.bookDuration -
				this.tillChapter -
				this.lastProgress.filePosition
			)
		},
		playerIsPlaying() {
			return this.$store.getters['player/isPlaying']
		},
		playerIsLoading() {
			return this.$store.getters['player/isLoading']
		},
	},
	beforeMount() {
		if (this.lastBookId) {
			console.log('SamllPlayer before mount', this.lastBookId)
			this.$store.dispatch('book/get', this.lastBookId)
		}
	},

	watch: {
		lastBookId(newId) {
			console.log('SamllPlayer watch', this.lastBookId)
			this.$store.dispatch('book/get', newId)
		},
		book(newval) {
			// if player is empty load last played book into it
			if (newval && !this.playerBookId && this.lastProgress) {
				try {
					this.$store.dispatch('player/loadFile', {
						bookId: this.lastProgress.bookId,
						fileIndex: this.lastProgress.fileIndex,
						filePosition: this.lastProgress.filePosition,
						startPlaying: false,
					})
				} catch (error) {
					console.log('Error', error)
					this.$toast.error(error, {
						icon: 'alert-circle-outline',
					})
				}
			}
		},
	},
	methods: {
		gotoBook() {
			this.$router.push(`/books/${this.playerBookId}`)
		},
		toMinutesAndSeconds,
		getFullUrl,
		playButtonClick() {
			// if no bookId in player is set
			if (this.playerIsPlaying || this.playerIsLoading) {
				this.$store.dispatch('player/pause')
			} else {
				this.$store.dispatch('player/resume')
			}
		},
		fastRewind() {
			this.$store.dispatch('player/fastRewind')
		},
	},
}
</script>

<style scoped>
.app-bar {
	background-color: #13202a !important;
}
.v-avatar {
	height: 100% !important;
	width: 72px !important;
	min-width: 80px !important;
	border-radius: unset;
}
.mid-column {
	flex-grow: 1;
	overflow: hidden;
}
.title {
	font-size: 16px;
}
.subtitle {
	color: rgba(255, 255, 255, 0.7);
}
/deep/ .v-toolbar__title {
	background-color: red !important;
	flex-grow: 1;
	width: 100%;
	height: 100%;
}
/deep/ .v-toolbar__content {
	padding-left: 4px;
	padding-top: 4px;
	padding-bottom: 4px;
	justify-content: space-between;
}
</style>
