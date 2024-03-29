import Vue from 'vue'
import { getDatabase } from '~/tools/database'
import { BOOK_OFFLINE_STATE, BOOK_OFFLINE_PROCESS_STATE } from '~/tools/consts'
import { deepClone } from '~/tools/helper'

export const state = () => ({
	booksMap: {},
	activeProcessMap: {},
	initialized: false,
})
const db = getDatabase()
const abortControllerMap = {}

export const mutations = {
	SET_BOOKS(state, books) {
		state.booksMap = books.reduce((acc, book) => {
			acc[book._id] = book
			return acc
		}, {})
	},
	ADD_BOOK(state, book) {
		Vue.set(state.booksMap, book._id, deepClone(book))
		state.booksMap = { ...state.booksMap }
	},
	BOOK_SET_OFFLINE_PROGRESS(
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
		// TODO: throw Error if book is not found
	},

	DELETE_BOOK(state, bookId) {
		Vue.set(state.booksMap, bookId, undefined)
	},
	START_DOWNLOAD(state, bookId) {
		Vue.set(
			state.activeProcessMap,
			bookId,
			BOOK_OFFLINE_PROCESS_STATE.downloading
		)
	},
	START_DELETING(state, bookId) {
		console.log('start deleting')
		Vue.set(
			state.activeProcessMap,
			bookId,
			BOOK_OFFLINE_PROCESS_STATE.deleting
		)
	},
	FINISH_PROCESS(state, bookId) {
		Vue.set(state.activeProcessMap, bookId, undefined)
	},
	INITIALIZED(state) {
		state.initialized = true
	},
}

export const actions = {
	async addBook(
		{ commit, dispatch, getters, rootGetters, rootState, root },
		bookId
	) {
		if (getters.isBookBeingDownloaded[bookId]) {
			console.warn(`Book ${bookId} is already downloading.`)
			return
		}

		// clone Object to prevent altering State
		await dispatch('book/get', bookId, { root: true })
		const book = deepClone(await rootGetters['book/getBook'](bookId))

		// Set start progress if not set
		book.progress = book.progress || 0
		book.progressFileIndex = book.progressFileIndex || 0
		try {
			commit('START_DOWNLOAD', bookId)

			const controller = new AbortController()
			abortControllerMap[bookId] = controller
			// download cover only if it is not all ready downloaded
			if (book.cover && book.cover[0] && !book.coverDbId) {
				const id = await db.downloadAndAddFile(
					{
						filepath: book.cover[0],
						filename: `${book._id}-cover`,
					},
					{ abortSignal: controller.signal }
				)
				book.coverDbId = id
			}
			await db.addBook(book)
			commit('ADD_BOOK', book)
			for (
				let index = book.progressFileIndex;
				index < book.files.length;
				index++
			) {
				const file = book.files[index]
				const controller = new AbortController()
				abortControllerMap[bookId] = controller
				console.log(`Download ${index}`, file.filename)
				file.dbId = await db.downloadAndAddFile(file, {
					abortSignal: controller.signal,
				})
				book.progress = Math.round(((index + 1) / book.files.length) * 100)
				book.progressFileIndex = index

				await db.updateBook(book)
				commit('ADD_BOOK', book)
				// check if download is still active if not stop
				if (!abortControllerMap[bookId]) {
					break
				}
			}
		} catch (error) {
			console.log(error.message, typeof error)
			if (error.message === 'The user aborted a request.') {
				// do nothing
			} else if (error.message === 'Failed to fetch') {
				// do nothing
				dispatch(
					'messages/showError',
					`No Internet connection abort downloading ${book.title}`,
					{ root: true }
				)
			} else {
				throw error
			}
		} finally {
			commit('FINISH_PROCESS', bookId)
		}
	},
	pauseDownload({ commit }, bookId) {
		// Abort controller is available call it
		if (abortControllerMap[bookId]) {
			try {
				abortControllerMap[bookId].abort()
			} catch (error) {
				console.log(error)
			}
		}
		abortControllerMap[bookId] = undefined
	},
	async deleteBook({ commit, state }, bookId) {
		const book = { ...state.booksMap[bookId] }
		commit('START_DELETING', bookId)
		try {
			if (book) {
				for (let index = book.progressFileIndex; index >= 0; index--) {
					const file = book.files[index]
					if (file.dbId) {
						await db.deleteFile(file.dbId)
					}

					await db.updateBook(book)
					commit('BOOK_SET_OFFLINE_PROGRESS', {
						bookId: book._id,
						progress: Math.round(((index + 1) / book.files.length) * 100),
						progressFileIndex: index,
						fileIndex: index,
					})
				}
				if (book.cover && book.cover[0] && !book.coverDbId) {
					await db.deleteFile(book.coverDbId)
				}
				await db.deleteBook(book.id)
				commit('DELETE_BOOK', bookId)
			}
		} finally {
			commit('FINISH_PROCESS', bookId)
		}
	},
	async initialize({ commit }) {
		const books = await db.getBooks()
		console.log('offlineInit:', books)
		commit('SET_BOOKS', books)
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
		return deepClone(state.booksMap[bookId])
	},
	getBookDownloadProgress: (state) => (bookId) => {
		return state.booksMap[bookId] ? state.booksMap[bookId].progress : 0
	},
	isBookBeingDownloaded: (state) => (bookId) => {
		return (
			state.activeProcessMap[bookId] ===
			BOOK_OFFLINE_PROCESS_STATE.downloading
		)
	},
	isBookBeingDeleted: (state) => (bookId) => {
		return (
			state.activeProcessMap[bookId] === BOOK_OFFLINE_PROCESS_STATE.deleting
		)
	},
	books: (state) => Object.values(state.booksMap),
	initialized: (state) => state.initialized,
}

export default {
	state,
	mutations,
	actions,
	getters,
}
