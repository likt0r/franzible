export const state = () => ({
  bookId: null,
  chapterIndex: null,
})

export const mutations = {
  SET_BOOK_CHAPTER(state, { bookId, chapterIndex }) {
    state.bookId = bookId
    state.chapterIndex = chapterIndex
  },
}

export const actions = {
  playChapter({ dispatch, commit, getters, state }, { bookId, chapterIndex }) {
    if (state.bookId !== bookId || state.chapterIndex !== chapterIndex) {
      commit('SET_BOOK_CHAPTER', { bookId, chapterIndex })
    } else {
      console.warn(
        'ACTION/playChapter: Boock and Chapter are the same as current'
      )
    }
  },
}

export const getters = {
  activeBookId(state) {
    return state.bookId
  },
  activeChapterIndex(state) {
    return state.chapterIndex
  },
}

const playerInit = (store) => {
  // called when the store is initialized
  console.log('#player: Init Player')
  store.subscribe((mutation, state) => {
    // called after every mutation.
    // The mutation comes in the format of `{ type, payload }`.
  })
}

export const plugins = [playerInit]
