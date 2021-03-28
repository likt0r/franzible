import { getDatabase } from '~/tools/database'
export const state = () => ({
  books: [],
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
}

export const actions = {
  async addBook({ commit, dispatch, state }, bookId) {
    if (!state.books.find((el) => el._id === bookId)) {
      // get Book Object
      const book = await dispatch('books/get', bookId, { root: true })
      // download cover
      console.log(book)
      if (book.cover[0]) {
        const id = await db.downloadAndAddFile({
          filepath: book.cover[0],
          filename: `${book._id}-cover`,
        })
        book.coverDbId = id
      }
      for (const file of book.files) {
        file.dbId = await db.downloadAndAddFile(file)
      }

      await db.addBook(book)
      commit('ADD_BOOK', book)
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
}
export const offlineInitPlugin = async ({ commit }) => {
  const books = await db.getBooks()
  console.log('offlineInitPlugin:', books)
  commit('offline/SET_BOOKS', books)
}
