import { getDatabase } from './database'
const database = getDatabase()
export const PLAYER_STATE_ENUM = {
	playing: 'playing',
	stopped: 'stopped',
	loading: 'loading',
	error: 'error',
}
export const PLAYER_SIMPLE_STATE_ENUM = {
	playing: 'playing',
	stopped: 'stopped',
}
class AudioPlayer {
	constructor(store) {
		this.reloadSrcFlag = false
		this.store = null
		this.elAudio = new Audio()
		this.elPreloader = new Audio()
		this.playing = false
		this.loading = false
		this.fileIndex = null
		this.files = []
		this.fileIndex = 0
		this.filePosition = 0
		this.store = store
		this.isIOsInitialized = false
		this.currentSrc = ''
		// this state is needed for not showing loading animation if player preloading
		this.simpleState = PLAYER_SIMPLE_STATE_ENUM.stopped

		// Add all Media Listeners
		this.elAudio.addEventListener('play', () => {
			// Fires when the audio/video has been started or is no longer paused
		})
		this.elAudio.addEventListener('playing', () => {
			// Fires when the audio/video is playing after having
			// been paused or stopped for buffering
			console.log('#player: playing', this.fileIndex)
			this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.playing)
		})
		this.elAudio.addEventListener('pause', () => {
			// Fires when the audio/video has been paused
			console.log('#player: pause', this.fileIndex)
			this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.stopped)
		})
		this.elAudio.addEventListener('error', (error) => {
			// Fires when the audio/video has been paused
			console.log('#player: error', error)
			this.reloadSrcFlag = true
			this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.error)
		})
		this.elAudio.addEventListener('stalled', () => {
			// Fires when the audio/video has been paused
			console.log('#player: stalled', this.fileIndex)
			this.reloadSrcFlag = true
			this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.error)
		})
		this.elAudio.addEventListener('suspend', () => {
			// Fires when the audio/video has been paused
			console.log('#player: suspend', this.fileIndex)
			// this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.loading)
		})
		this.elAudio.addEventListener('abort', () => {
			// Fires when the audio/video has been paused
			console.log('#player: abort', this.fileIndex)
			// this.reloadSrcFlag = true
			// this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.loading)
		})
		this.elAudio.addEventListener('loadstart', () => {
			// Fires when the audio/video has been paused
			if (this.simpleState === PLAYER_SIMPLE_STATE_ENUM.playing) {
				console.log('#player: loadstart', this.fileIndex)
				this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.loading)
			}
		})
		this.elAudio.addEventListener('timeupdate', (event) => {
			// Fires when the audio/video has been paused
			// console.log('#player: timeupdate', event)
			this.store.commit('player/SET_FILE_POSITION', this.elAudio.currentTime)
		})
		this.elAudio.addEventListener('ended', (event) => {
			// Fires when the audio/video has been paused
			// console.log('#player: timeupdate', event)
			this.store.dispatch('player/skipNext')
			this.simpleState = PLAYER_SIMPLE_STATE_ENUM.stopped
		})
	}

	async loadAudioBook({
		audioUrl,
		audioDbId,
		filePosition = 0,
		startPlaying,
	}) {
		console.log('#load AudioBook', {
			audioUrl,
			audioDbId,
			filePosition,
			startPlaying,
		})
		if (audioDbId) {
			if (this.elAudio.src && this.elAudio.src.startsWith('blob:')) {
				URL.revokeObjectURL(this.elAudio.src)
			}
			console.log('GEfile from dataBaseID')
			this.elAudio.src = await database.getFileContentUrl(audioDbId)
		} else {
			this.elAudio.src = audioUrl
		}
		this.currentSrc = this.elAudio.src
		this.elAudio.currentTime = filePosition
		if (startPlaying) {
			await this.__play()
		}
	}

	async __play() {
		// If error occurs src has to be reloaded to prevent media stall
		this.simpleState = PLAYER_SIMPLE_STATE_ENUM.playing
		this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.loading)
		if (this.reloadSrcFlag) {
			const currentTime = this.elAudio.currentTime
			this.reloadSrcFlag = false
			this.elAudio.load()
			this.elAudio.currentTime = currentTime
		}
		try {
			await this.elAudio.play()
			console.log('#player: __play')
			this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.playing)
		} catch (error) {
			console.error(error)
			if (
				error.message ===
				'The play() request was interrupted by a call to pause().'
			) {
				this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.stopped)
			}
		}
	}

	pause() {
		console.log('#Player Pause Audio')
		this.simpleState = PLAYER_SIMPLE_STATE_ENUM.stopped
		this.elAudio.pause()
	}

	resume() {
		console.log('#Player resume Audio')
		this.__play()
	}

	setSpeed(speed) {
		this.elAudio.playbackRate = speed
	}

	seek(position) {
		if (this.simpleState === PLAYER_SIMPLE_STATE_ENUM.playing) {
			this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.loading)
		}
		this.elAudio.currentTime = position
	}

	async initAudioElement() {
		if (!this.isIOsInitialized) {
			console.log('Start initin Element for ios')
			const oldSrc = this.elAudio.src
			this.elAudio.src =
				'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
			await this.elAudio.play()
			this.elAudio.pause()
			this.elAudio.src = oldSrc
			console.log('ended')
			this.isIOsInitialized = true
		}
	}
}

let instance = null
export function init(store) {
	if (instance) throw new Error('AudioPlayer allready instantiated')
	instance = new AudioPlayer(store)
}
export function getInstance() {
	if (!instance) throw new Error('AudioPlayer is not instantiated')
	return instance
}
