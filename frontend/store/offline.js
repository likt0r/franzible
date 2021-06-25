import Vue from 'vue'
import { getDatabase } from '~/tools/database'
import { BOOK_OFFLINE_STATE } from '~/tools/consts'
export const state = () => ({
	booksMap: {},
	activeDownloadsMap: {},
})
const db = getDatabase()
const processMap = {}

export const mutations = {
	SET_BOOKS(state, books) {
		state.booksMap = books.reduce((acc, book) => {
			acc[book._id] = book
			return acc
		}, {})
	},
	ADD_BOOK(state, book) {
		Vue.set(state.booksMap, book._id, JSON.parse(JSON.stringify(book)))
		state.booksMap = { ...state.booksMap }
	},
	BOOK_SET_PROGRESS(
		state,
		{ bookId, progress, progressFileIndex, fileIndex, dbId }
	) {
		const book = state.booksMap[bookId]
		if (book) {
			book.progressFileIndex = progressFileIndex
			book.progress = progress
			book.files[fileIndex].dbId = dbId
		}
		state.booksMap = { ...state.booksMap }
		//TODO: throw Error
	},

	DELETE_BOOK(state, bookId) {
		Vue.set(state.booksMap, bookId, undefined)
	},
	START_DOWNLOAD(state, bookId) {
		Vue.set(state.activeDownloadsMap, bookId, true)
	},
	FINISH_DOWNLOAD(state, bookId) {
		Vue.set(state.activeDownloadsMap, bookId, undefined)
	},
}

export const actions = {
	async addBook({ commit, dispatch, getters }, bookId) {
		if (getters.isBookDownloading[bookId]) {
			console.warn(`Book ${bookId} is allready downloading.`)
			return
		}
		// const book = state.booksMap[bookId]
		const book =
			getters.getBook(bookId) ||
			(await dispatch('books/get', bookId, { root: true }))

		// Set start progress if not set
		book.progress = book.progress || 0
		book.progressFileIndex = book.progressFileIndex || 0
		commit('START_DOWNLOAD', bookId)
		processMap[bookId] = true
		// download cover
		if (book.cover[0]) {
			const id = await db.downloadAndAddFile({
				filepath: book.cover[0],
				filename: `${book._id}-cover`,
			})
			book.coverDbId = id
		}
		await db.addBook(book)
		commit('ADD_BOOK', JSON.parse(JSON.stringify(book)))
		for (
			let index = book.progressFileIndex;
			index < book.files.length;
			index++
		) {
			const file = book.files[index]
			file.dbId = await db.downloadAndAddFile(file)
			book.progress = Math.round(((index + 1) / book.files.length) * 100)
			book.progressFileIndex = index

			await db.updateBook(book)
			commit('ADD_BOOK', JSON.parse(JSON.stringify(book)))
			// check if download is still active if not stop
			if (!processMap[bookId]) {
				break
			}
		}

		commit('FINISH_DOWNLOAD', bookId)
	},
	async pauseDownload({ commit }, bookId) {
		processMap[bookId] = undefined
		commit('FINISH_DOWNLOAD', bookId)
	},
	async deleteBook({ commit, state }, bookId) {
		const book = { ...state.booksMap[bookId] }
		if (book) {
			for (let index = book.progressFileIndex; index >= 0; index--) {
				const file = book.files[index]
				await db.deleteFile(file.dbId)

				await db.updateBook(book)
				commit('BOOK_SET_PROGRESS', {
					bookId: book._id,
					progress: Math.round(((index + 1) / book.files.length) * 100),
					progressFileIndex: index,
					fileIndex: index,
				})
			}
			if (book.cover[0]) {
				await db.deleteFile(book.coverDbId)
			}
			await db.deleteBook(book.id)
			commit('DELETE_BOOK', bookId)
		}
	},
}

export const getters = {
	getBookOfflineState: (state) => (bookId) => {
		const book = state.booksMap[bookId]
		if (book && book.progress === 100) {
			return BOOK_OFFLINE_STATE.complete
		}
		if (book) {
			return BOOK_OFFLINE_STATE.partial
		}

		return BOOK_OFFLINE_STATE.notStarted
	},
	getBook: (state) => (bookId) => {
		return state.booksMap[bookId]
			? JSON.parse(JSON.stringify(state.booksMap[bookId]))
			: undefined
	},
	getBookDownloadProgress: (state) => (bookId) => {
		return state.booksMap[bookId] ? state.booksMap[bookId].progress : 0
	},
	isBookDownloading: (state) => (bookId) => {
		return typeof state.activeDownloadsMap[bookId] !== 'undefined'
	},
	books: (state) => Object.values(state.booksMap),
}
export const offlineInitPlugin = async ({ commit }) => {
	const books = await db.getBooks()
	console.log('offlineInitPlugin:', books)
	commit('offline/SET_BOOKS', books)
}
