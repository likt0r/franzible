import { getDatabase } from './database'
const database = getDatabase()
export const PLAYER_STATE_ENUM = {
	playing: 'playing',
	stopped: 'stopped',
	loading: 'loading',
	error: 'error',
}

class AudioPlayer {
	constructor(store) {
		this.reloadSrcFlag = false
		this.store = null
		this.elAudio = document.createElement('AUDIO')
		this.elPreloader = document.createElement('AUDIO')
		this.playing = false
		this.loading = false
		this.fileIndex = null
		this.files = []
		this.fileIndex = 0
		this.filePosition = 0
		this.store = store
		this.currentSrc = ''

		// Add all Media Listeners
		this.elAudio.addEventListener('play', () => {
			// Fires when the audio/video has been started or is no longer paused
			console.log('#player: play', this.fileIndex)
			this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.playing)
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
			this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.error)
		})
		this.elAudio.addEventListener('suspend', () => {
			// Fires when the audio/video has been paused
			console.log('#player: suspend', this.fileIndex)
		})
		this.elAudio.addEventListener('loadstart', () => {
			// Fires when the audio/video has been paused
			console.log('#player: loadstart', this.fileIndex)
			this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.loading)
		})
		this.elAudio.addEventListener('timeupdate', (event) => {
			// Fires when the audio/video has been paused
			// console.log('#player: timeupdate', event)
			this.store.commit('player/SET_FILE_POSTION', this.elAudio.currentTime)
		})
		this.elAudio.addEventListener('ended', (event) => {
			// Fires when the audio/video has been paused
			// console.log('#player: timeupdate', event)
			this.store.dispatch('player/skipNext')
		})
	}

	async loadAudioBook({ audioUrl, audioDbId, filePosition = 0, startPlaying }) {
		if (audioDbId) {
			if (this.elAudio.src && this.elAudio.src.startsWith('blob:')) {
				URL.revokeObjectURL(this.elAudio.src)
			}
			this.elAudio.src = await database.getFileContentUrl(audioDbId)
		} else {
			this.elAudio.src = audioUrl
		}
		this.currentSrc = this.elAudio.src
		this.elAudio.currentTime = filePosition
		if (startPlaying) {
			this.__play()
		}
	}

	__play() {
		// If error occurs src has to be reloaded to prevent media stall
		if (this.reloadSrcFlag) {
			this.reloadSrcFlag = false
			this.elAudio.load()
		}
		this.elAudio.play().catch((error) => {
			// do nothing error is handled in media Event listeners
			if (error) {
				// Do nothing
			}
		})
	}

	pause() {
		this.elAudio.pause()
	}

	resume() {
		this.__play()
	}

	setSpeed(speed) {
		this.elAudio.playbackRate = speed
	}

	seek(position) {
		this.elAudio.currentTime = position
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
