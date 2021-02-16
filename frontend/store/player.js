import { PLAYER_STATE_ENUM, getInstance, init } from '../tools/AudioPlayer'
import { getFullUrl } from '../tools/url'

export const state = () => ({
  bookId: null,
  book: null,
  fileIndex: null,
  filePosition: 0,
  playerState: PLAYER_STATE_ENUM.stopped,
  fastStep: 30,
  progressId: null,
})

export const mutations = {
  SET_BOOK_FILE(
    state,
    { bookId, book, fileIndex, filePosition = 0, progressId }
  ) {
    state.bookId = bookId
    state.fileIndex = fileIndex
    state.book = book
    state.filePosition = filePosition
    state.progressId = progressId
  },
  SET_FILE(state, { fileIndex, filePosition = 0 }) {
    state.fileIndex = fileIndex
    state.filePosition = filePosition
  },
  // playerState = playing | stopped | loading | error
  SET_STATE(state, playerState) {
    if (Object.values(PLAYER_STATE_ENUM).includes(playerState)) {
      state.playerState = playerState
    } else {
      throw new Error(`Unkown Player state: ${playerState}`)
    }
  },

  SET_FILE_POSTION(state, filePosition) {
    state.filePosition = filePosition
  },
}

export const actions = {
  async playFile(
    { dispatch, commit, getters, state, rootGetters },
    { bookId, fileIndex, filePosition = 0 }
  ) {
    if (state.bookId !== bookId || state.fileIndex !== fileIndex) {
      const book = rootGetters['books/get'](bookId)
      const { _id: progressId } = rootGetters['progress/find']({
        query: {
          bookId,
        },
      }).data[0]

      commit('SET_BOOK_FILE', {
        bookId,
        book,
        fileIndex,
        filePosition,
        progressId,
      })
      getInstance().loadAudioBook({
        audioUrl: getFullUrl(book.files[fileIndex].filepath),
        filePosition,
      })
    } else {
      console.warn('ACTION/playFile: Boock and File are the same as current')
    }
  },
  pause() {
    getInstance().pause()
  },
  resume() {
    getInstance().resume()
  },
  fastForward({ state, dispatch }) {
    const file = state.book.files[state.fileIndex]
    if (state.filePosition + state.fastStep < file.duration) {
      getInstance().seek(state.filePosition + state.fastStep)
    } else {
      dispatch('skipNext', state.filePosition + state.fastStep - file.duration)
    }
  },
  fastRewind({ state, dispatch }) {
    if (state.filePosition - state.fastStep > 0) {
      getInstance().seek(state.filePosition - state.fastStep)
    } else if (state.fileIndex - 1 > 0) {
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
        filePosition: position,
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
        filePosition: position,
      })
    } else {
      getInstance().seek(0)
    }
  },
}

export const getters = {
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
  console.log('#player: Init Player')
  if (process.client) {
    init(store)
  }
  store.subscribe((mutation, state) => {
    // called after every mutation.
    // The mutation comes in the format of `{ type, payload }`.
    if (
      [
        'player/SET_BOOK_FILE',
        'player/SET_FILE',
        'player/SET_FILE_POSTION',
      ].includes(mutation.type)
    ) {
      console.log('update position')
      store.dispatch('progress/patch', [
        state.player.progressId,
        {
          fileIndex: state.player.fileIndex,
          filePosition: state.player.filePosition,
        },
      ])
    }
  })
}