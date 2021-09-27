/* global MediaMetadata:true */
import { PLAYER_STATE_ENUM, getInstance, init } from '../tools/AudioPlayer'
import { getFullUrl } from '../tools/url'

export const state = () => ({
	bookId: null,
	book: null,
	fileIndex: null,
	filePosition: 0,
	playerState: PLAYER_STATE_ENUM.stopped,
	fastStep: 30,
	speed: 100,
})

export const mutations = {
	SET_BOOK_FILE(state, { bookId, book, fileIndex, filePosition = 0 }) {
		state.bookId = bookId
		state.fileIndex = fileIndex
		state.book = book
		state.filePosition = filePosition
	},
	SET_FILE(state, { fileIndex, filePosition = 0 }) {
		state.fileIndex = fileIndex
		state.filePosition = filePosition
	},
	// playerState = playing | stopped | loading | error
	SET_STATE(state, playerState) {
		if (Object.values(PLAYER_STATE_ENUM).includes(playerState)) {
			console.log('#Player state is: ', playerState)
			state.playerState = playerState
		} else {
			throw new Error(`Unknown Player state: ${playerState}`)
		}
	},

	SET_FILE_POSITION(state, filePosition) {
		state.filePosition = filePosition
	},
	SET_SPEED(state, speed) {
		state.speed = speed
	},
}

export const actions = {
	async loadFile(
		{ dispatch, commit, getters, state, rootGetters },
		{ bookId, fileIndex, filePosition = 0, startPlaying = false }
	) {
		if (state.bookId !== bookId || state.fileIndex !== fileIndex) {
			await dispatch('book/get', bookId, { root: true })
			const book = rootGetters['book/getBook'](bookId)
			if (!book) {
				return console.warn('Book not found with id', bookId)
			}

			commit('SET_BOOK_FILE', {
				bookId,
				book,
				fileIndex,
				filePosition,
			})

			await getInstance().loadAudioBook({
				audioUrl: getFullUrl(book.files[fileIndex].filepath),
				audioDbId: book.files[fileIndex].dbId,
				filePosition,
				startPlaying,
			})
			// set media Notification from Chrome
			if ('mediaSession' in navigator) {
				/** */
				navigator.mediaSession.metadata = new MediaMetadata({
					title: state.book.title,
					artist: `Kapitel ${fileIndex + 1}/${book.files.length}`,
					// album:
					artwork: [
						{
							src: getFullUrl(
								(state.book.cover && state.book.cover[0]) || '/logo.png'
							),
							sizes: '512x512',
							type: 'image/png',
						},
					],
				})

				navigator.mediaSession.setActionHandler('play', function () {
					dispatch('resume')
				})
				navigator.mediaSession.setActionHandler('pause', function () {
					dispatch('pause')
				})
				navigator.mediaSession.setActionHandler(
					'seekbackward',
					function () {
						dispatch('fastRewind')
					}
				)
				// navigator.mediaSession.setActionHandler('seekforward', function () {})
				// navigator.mediaSession.setActionHandler('previoustrack', function () {})
				// navigator.mediaSession.setActionHandler('nexttrack', function () {})
			}
		} else {
			console.warn('ACTION/playFile: Boock and File are the same as current')
		}
	},
	setSpeed({ commit }, speed) {
		commit('SET_SPEED', speed)
		getInstance().setSpeed(speed / 100)
	},
	pause() {
		console.log('Action Pause')
		getInstance().pause()
	},

	async resume({ dispatch, rootGetters }) {
		if (rootGetters['player/activeBookId']) {
			getInstance().resume()
		} else {
			const bookId = rootGetters['progress/lastPlayedBookId']
			console.log('SmallPlayer lastProgress id', bookId)
			const progress = bookId
				? rootGetters['progress/getByBookId'](
						rootGetters['progress/lastPlayedBookId']
				  )
				: null
			console.log('SmallPlayer lastProgress book', progress)

			await dispatch('loadFile', {
				bookId: progress.bookId,
				fileIndex: progress.fileIndex,
				filePosition: progress.filePosition,
				startPlaying: true,
			})
		}
	},

	fastForward({ state, dispatch }) {
		const file = state.book.files[state.fileIndex]
		if (state.filePosition + state.fastStep < file.duration) {
			getInstance().seek(state.filePosition + state.fastStep)
		} else {
			dispatch(
				'skipNext',
				state.filePosition + state.fastStep - file.duration
			)
		}
	},

	fastRewind({ state, dispatch }) {
		if (state.filePosition - state.fastStep > 0) {
			getInstance().seek(state.filePosition - state.fastStep)
		} else if (state.fileIndex - 1 > -1) {
			dispatch(
				'skipPrevious',
				state.book.files[state.fileIndex - 1].duration +
					(state.filePosition - state.fastStep)
			)
		} else {
			getInstance().seek(0)
		}
	},

	seek(_, position) {
		getInstance().seek(position)
	},

	skipNext({ commit, state }, position = 0) {
		// has next
		if (state.fileIndex < state.book.files.length - 1) {
			commit('SET_FILE', {
				fileIndex: state.fileIndex + 1,
				filePosition: position,
			})
			getInstance().loadAudioBook({
				audioUrl: getFullUrl(state.book.files[state.fileIndex].filepath),
				audioDbId: state.book.files[state.fileIndex].dbId,
				filePosition: position,
				startPlaying: true,
			})
		} else {
			getInstance().seek(state.book.files[state.fileIndex].duration - 0.01)
		}
	},

	skipPrevious({ commit, state }, position = 0) {
		// has next
		if (state.fileIndex > 0) {
			commit('SET_FILE', { fileIndex: state.fileIndex - 1, filePosition: 0 })
			getInstance().loadAudioBook({
				audioUrl: getFullUrl(state.book.files[state.fileIndex].filepath),
				audioDbId: state.book.files[state.fileIndex].dbId,
				filePosition: position,
				startPlaying: true,
			})
		} else {
			getInstance().seek(0)
		}
	},
}

export const getters = {
	speed(state) {
		return state.speed
	},
	activeBookId(state) {
		return state.bookId
	},
	activeFileIndex(state) {
		return state.fileIndex
	},
	isPlaying(state) {
		return state.playerState === PLAYER_STATE_ENUM.playing
	},
	isLoading(state) {
		return state.playerState === PLAYER_STATE_ENUM.loading
	},
	filePositionInSecs(state) {
		return state.filePosition
	},
	fileRemainingTime(state) {
		return state.book
			? state.book.files[state.fileIndex].duration - state.filePosition
			: 0
	},
	fileDuration(state) {
		return state.book ? state.book.files[state.fileIndex].duration : 0
	},
	hasPrevious(state) {
		return state.fileIndex > 0
	},
	hasNext(state) {
		return state.fileIndex < state.files.length - 1
	},
}

export const playerInitPlugin = (store) => {
	// called when the store is initialized
	console.log('#player: Init Player', store)
	if (process.client) {
		init(store)
	}
	// add Key pressed listeners
	window.addEventListener('keydown', (event) => {
		if (event.code === 'Space' && event.target === document.body) {
			event.preventDefault()
		}
	})
	window.addEventListener('keyup', (event) => {
		console.log('#player', event)
		if (event.code === 'Space' && event.target === document.body) {
			event.preventDefault()
			if (store.getters['player/isPlaying']) {
				store.dispatch('player/pause')
				return false
			} else {
				store.dispatch('player/resume')
			}
		}
	})

	let lastTimeUpdate = 0
	store.subscribe((mutation, state) => {
		// called after every mutation.
		// The mutation comes in the format of `{ type, payload }`.
		if (
			[
				'player/SET_BOOK_FILE',
				'player/SET_FILE',
				'player/SET_FILE_POSITION',
			].includes(mutation.type)
		) {
			// console.log(
			// 	'update position',
			// 	!!store.getters['progress/getByBookId'](state.player.bookId)
			// )
			if (store.getters['progress/getByBookId'](state.player.bookId)) {
				// update store progress only every second
				if (Date.now() - lastTimeUpdate > 1000) {
					store.dispatch('progress/patchByBookId', {
						bookId: state.player.bookId,
						fileIndex: state.player.fileIndex,
						filePosition: state.player.filePosition,
					})
					lastTimeUpdate = Date.now()
				}
			} else {
				store.dispatch('progress/createByBookId', state.player.bookId)
			}
		}
	})
}
