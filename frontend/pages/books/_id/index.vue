<template>
	<v-container class="fill-height" style="background-color: black">
		<transition name="fade">
			<v-row v-if="isGetBookPending && !book" justify="center" class="pa-0">
				<v-col xs="12" sm="8" md="8" lg="5" xl="4">
					<v-skeleton-loader
						type="image, image, card-heading, actions, actions"
					></v-skeleton-loader> </v-col
			></v-row>

			<fragment v-else>
				<v-row justify="center" class="pa-0">
					<v-col xs="12" sm="8" md="8" lg="5" xl="4" class="pa-0">
						<offline-image
							:src="book.cover ? getFullUrl(book.cover) : '/logo.png'"
							:db-id="book && book.coverDbId"
							contain
						>
							<fragment>
								<v-overlay absolute :value="timerActiveState">
									<h1>{{ timerDisplay(timerCurrentTime) }}</h1>
								</v-overlay>
								<v-btn class="edit" :to="`/books/${book._id}/edit`" fab>
									<v-icon>mdi-square-edit-outline</v-icon>
								</v-btn>
							</fragment>
						</offline-image>
					</v-col>
				</v-row>
				<v-row justify="center" class="pa-0" align="end">
					<v-col xs="12" sm="8" md="8" lg="5" xl="4" class="pa-0">
						<v-card v-if="book" class="mx-auto">
							<v-card-subtitle class="pb-0 text-center">
								{{ book.files[activeFileIndex].filename }}
							</v-card-subtitle>
							<v-card-text
								><v-slider
									v-model="sliderPosition"
									class="pb-0 pt-0 text-center"
									:max="fileDuration"
									min="0"
									@mousedown="sliederIsTouched = true"
									@mouseup="sliederIsTouched = false"
									@change="seek"
								></v-slider>
							</v-card-text>
							<v-card-text class="pt-0">
								<v-row class="pt-0 pr-2 pl-2">
									<v-col class="text-left pt-0 pb-0" :cols="3">{{
										toMinutesAndSeconds(filePositionInSecs)
									}}</v-col>

									<v-col class="text-center pt-0 pb-0" :cols="6"
										>{{
											toMinutesAndSeconds(bookRemainingTime)
										}}
										verbleibend</v-col
									>

									<v-col class="text-right pt-0 pb-0" :cols="3"
										>-{{ toMinutesAndSeconds(fileRemainingTime) }}</v-col
									>
								</v-row>
							</v-card-text>
							<v-card-actions>
								<v-spacer></v-spacer>

								<v-btn
									fab
									:medium="!$vuetify.breakpoint.xs"
									:small="!!$vuetify.breakpoint.xs"
									dark
									@click.stop="skipPrevious"
								>
									<v-icon medium color="secondary"
										>mdi-skip-previous-outline</v-icon
									>
								</v-btn>

								<v-btn
									fab
									:medium="!$vuetify.breakpoint.xs"
									:small="!!$vuetify.breakpoint.xs"
									dark
									@click.stop="fastRewind"
								>
									<v-icon color="secondary" medium>mdi-rewind-30</v-icon>
								</v-btn>

								<v-btn
									class="play"
									fab
									:x-large="!$vuetify.breakpoint.xs"
									:medium="!!$vuetify.breakpoint.xs"
									dark
									@click.stop="playButtonClick"
								>
									<v-progress-circular
										v-if="playerIsLoading"
										:rotate="-90"
										:size="$vuetify.breakpoint.xs ? 54 : 72"
										:width="2"
										:indeterminate="true"
										color="secondary"
									>
										<v-icon color="secondary">{{
											playerIsPlaying || playerIsLoading
												? 'mdi-pause'
												: 'mdi-play'
										}}</v-icon>
									</v-progress-circular>
									<v-icon v-else color="secondary">{{
										playerIsPlaying || playerIsLoading
											? 'mdi-pause'
											: 'mdi-play'
									}}</v-icon>
								</v-btn>

								<v-btn
									fab
									:medium="!$vuetify.breakpoint.xs"
									:small="!!$vuetify.breakpoint.xs"
									dark
									@click.stop="fastForward"
								>
									<v-icon medium color="secondary">mdi-fast-forward-30</v-icon>
								</v-btn>

								<v-btn
									fab
									:medium="!$vuetify.breakpoint.xs"
									:small="!!$vuetify.breakpoint.xs"
									dark
									@click.stop="skipNext"
								>
									<v-icon medium color="secondary"
										>mdi-skip-next-outline</v-icon
									>
								</v-btn>

								<v-spacer></v-spacer>
							</v-card-actions>
							<player-bottom-navigation></player-bottom-navigation>
						</v-card>
					</v-col>
				</v-row>
			</fragment>
		</transition>
	</v-container>
</template>

<script>
import { Fragment } from 'vue-fragment'
import { makeGetMixin } from 'feathers-vuex'
import { mapGetters, mapActions } from 'vuex'
import { toMinutesAndSeconds } from '../../../tools/formatTime'
import { getFullUrl } from '../../../tools/url'
import PlayerBottomNavigation from '~/components/PlayerBottomNavigation.vue'
import OfflineImage from '~/components/OfflineImage.vue'
export default {
	name: 'Player',
	components: {
		PlayerBottomNavigation,
		Fragment,
		OfflineImage,
	},
	mixins: [
		makeGetMixin({
			service: 'books', // depending on service
			id() {
				return this.$route.params.id
			},
		}),
		makeGetMixin({
			service: 'progress', // depending on service
			id() {
				return this.rprogressId
			},
		}),
	],
	layout: 'default',
	transition: 'slide-left',

	async asyncData({ params, store }) {
		let response = await store.dispatch('progress/find', {
			query: { bookId: params.id },
		})
		console.log('#asyncData res', response)
		if (response.length === 0) {
			// progress does not exist create it
			await store.dispatch('progress/create', {
				bookId: params.id,
				fileIndex: 0,
				filePosition: 0,
			})
			response = await store.dispatch('progress/find', {
				query: { bookId: params.id },
			})
			console.log('#asyncData res', response)
		}
		const progress = response[0]
		console.log('#asyncData', progress)
		return { rprogressId: progress._id }
	},

	data() {
		return {
			sliderPosition: 0,
			sliederIsTouched: false,
		}
	},
	computed: {
		...mapGetters(['fileListState']),
		imageWidth() {
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					return '220px'
				case 'sm':
					return '400px'
				case 'md':
					return '500px'
				case 'lg':
					return '592px'
				case 'xl':
					return '800px'
			}
			return '800px'
		},

		timerActiveState() {
			return this.$store.getters['timer/getTimeActiveState']
		},
		timerCurrentTime() {
			return this.$store.getters['timer/getCurrentTime']
		},
		activeBookId() {
			return this.$store.getters['player/activeBookId']
		},
		activeFileIndex() {
			return this.activeBookId === this.bookId
				? this.$store.getters['player/activeFileIndex']
				: this.progress.fileIndex
		},
		playerIsLoading() {
			return this.activeBookId === this.bookId
				? this.$store.getters['player/isLoading']
				: false
		},
		playerIsPlaying() {
			return this.activeBookId === this.bookId
				? this.$store.getters['player/isPlaying']
				: false
		},
		filePositionInSecs() {
			return this.activeBookId === this.bookId
				? this.$store.getters['player/filePositionInSecs']
				: this.progress.filePosition
		},
		fileDuration() {
			return this.activeBookId === this.bookId
				? this.$store.getters['player/fileDuration']
				: this.book.files[this.progress.fileIndex].duration
		},
		fileRemainingTime() {
			return this.activeBookId === this.bookId
				? this.$store.getters['player/fileRemainingTime']
				: this.fileDuration
		},
		bookDuration() {
			return this.book
				? this.book.files.reduce((acc, file) => acc + file.duration, 0)
				: 0
		},
		tillChapter() {
			if (this.progress) {
				let tillChapter = 0
				for (let i = 0; i < this.progress.fileIndex; i++)
					tillChapter += this.book.files[i].duration
				return tillChapter
			} else {
				return 0
			}
		},
		bookRemainingTime() {
			return this.bookDuration - this.tillChapter - this.progress.filePosition
		},
		userIsAdmin() {
			return this.$store.state.auth.user && this.$store.state.auth.user.isAdmin
		},
	},
	watch: {
		filePositionInSecs(value) {
			if (!this.sliederIsTouched) {
				this.sliderPosition = value
			}
		},
		sliderPosition(value) {
			if (this.sliederIsTouched) {
				this.seek(value)
			}
		},
	},
	mounted() {
		// initlaise slider position
		this.sliderPosition = this.progress.filePosition
	},
	methods: {
		...mapActions(['toggleFileList']),
		timerDisplay(time) {
			return time > -1 ? toMinutesAndSeconds(time) : 'Bis Kapitelende'
		},
		playButtonClick() {
			if (this.activeBookId !== this.bookId) {
				this.$store.dispatch('player/loadFile', {
					bookId: this.bookId,
					fileIndex: this.progress.fileIndex,
					filePosition: this.progress.filePosition,
					startPlaying: true,
				})
			} else if (this.playerIsPlaying || this.playerIsLoading) {
				this.$store.dispatch('player/pause')
			} else {
				this.$store.dispatch('player/resume')
			}
		},
		seek(position) {
			this.$store.dispatch('player/seek', position)
		},
		skipNext() {
			this.$store.dispatch('player/skipNext')
		},
		skipPrevious() {
			this.$store.dispatch('player/skipPrevious')
		},
		fastForward() {
			this.$store.dispatch('player/fastForward')
		},
		fastRewind() {
			this.$store.dispatch('player/fastRewind')
		},
		getFullUrl,
		toMinutesAndSeconds,
	},
}
</script>
<style scoped>
.fade-enter-active {
	transition: opacity 1s;
}
.fade-enter /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
.v-btn--fab.v-size--x-large .v-icon {
	font-size: 52px;
}
.v-btn--fab.v-size--default.play .v-icon {
	font-size: 42px;
}

.v-btn--fab.v-size--default .v-icon {
	font-size: 32px;
}
.edit {
	position: absolute;
	right: 0;
	margin: 4px;
}
</style>
