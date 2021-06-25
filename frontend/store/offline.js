import Vue from 'vue'
import { getDatabase } from '~/tools/database'
export const state = () => ({
  books: [],
  downloadProgress: {},
})
const db = getDatabase()

export const mutations = {
  SET_BOOKS(state, books) {
    state.books = books
  },
  ADD_BOOK(state, book) {
    state.books.push(book)
  },
  DELETE_BOOK(state, bookId) {
    for (let i = 0; i < state.books.length; i++) {
      if (state.books[i]._id === bookId) {
        state.books.splice(i, 1)
        state.books = [...state.books]
      }
    }
  },
  SET_BOOK_DOWNLOAD_PROGRESS(state, { bookId, progress }) {
    Vue.set(state.downloadProgress, bookId, progress)
  },
  DELETE_BOOK_DOWNLOAD_PROGRESS(state, bookId) {
    Vue.set(state.downloadProgress, bookId, undefined)
  },
}

export const actions = {
  async addBook({ commit, dispatch, state }, bookId) {
    if (!state.books.find((el) => el._id === bookId)) {
      // get Book Object
      if (state.downloadProgress[bookId]) {
        console.warn(`Book ${bookId} is allready downloading.`)
        return
      }
      const book = await dispatch('books/get', bookId, { root: true })
      // download cover

      console.log(book)
      commit('SET_BOOK_DOWNLOAD_PROGRESS', { bookId, progress: 0 })
      if (book.cover[0]) {
        const id = await db.downloadAndAddFile({
          filepath: book.cover[0],
          filename: `${book._id}-cover`,
        })
        book.coverDbId = id
      }
      for (const [index, file] of book.files.entries()) {
        file.dbId = await db.downloadAndAddFile(file)
        commit('SET_BOOK_DOWNLOAD_PROGRESS', {
          bookId,
          progress: Math.round(((index + 1) / book.files.length) * 100),
          progressFileIndex: index,
        })
      }

      await db.addBook(book)
      commit('ADD_BOOK', book)
      commit('DELETE_BOOK_DOWNLOAD_PROGRESS', bookId)
    }
  },
  async deleteBook({ commit, state }, bookId) {
    const book = state.books.find((el) => el._id === bookId)
    if (book) {
      if (book.cover[0]) {
        await db.deleteFile(book.coverDbId)
      }
      for (const file of book.files) {
        await db.deleteFile(file.dbId)
      }
      await db.deleteBook(book.id)
      commit('DELETE_BOOK', bookId)
    }
  },
}

export const getters = {
  isBookDownloaded: (state) => (bookId) => {
    return !!state.books.find((book) => book._id === bookId)
  },
  getBook: (state) => (bookId) => {
    return state.books.find((book) => book._id === bookId)
  },
  getBookDownloadProgress: (state) => (bookId) => {
    return state.downloadProgress[bookId]
  },
  isBookDownloading: (state) => (bookId) => {
    return typeof state.downloadProgress[bookId] !== 'undefined'
  },
}
export const offlineInitPlugin = async ({ commit }) => {
  const books = await db.getBooks()
  console.log('offlineInitPlugin:', books)
  commit('offline/SET_BOOKS', books)
}
