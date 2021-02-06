export const PLAYER_STATE_ENUM = {
  playing: 'playing',
  stopped: 'stopped',
  loading: 'loading',
  error: 'error',
}
class AudioPlayer {
  constructor(store) {
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
    this.elAudio.addEventListener('error', () => {
      // Fires when the audio/video has been paused
      console.log('#player: error', this.fileIndex)
      this.store.commit('player/SET_STATE', PLAYER_STATE_ENUM.error)
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

  loadAudioBook({ audioUrl, filePosition = 0 }) {
    this.elAudio.src = audioUrl
    this.elAudio.currentTime = filePosition
    this.elAudio.play()
  }

  pause() {
    this.elAudio.pause()
  }

  resume() {
    this.elAudio.play()
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
