import Vue from 'vue'
import { feathersClient } from '~/plugins/feathers'
import { deepClone } from '~/tools/helper'

export const state = () => ({
	bookMap: {},
})
export const mutations = {
	SET_BOOK(state, book) {
		Vue.set(state.bookMap, book._id, book)
	},
}
export const actions = {
	async get({ commit, state, rootState, rootGetters }, bookId) {
		if (!bookId) {
			return null
		}
		if (state.bookMap[bookId] || rootGetters['offline/getBook'](bookId)) {
			// update in background to improve snappinest
			if (feathersClient.io.connected) {
				feathersClient
					.service('books')
					.get(bookId)
					.then((result) => commit('SET_BOOK', result))
			}
			return state.bookMap[bookId]
		} else {
			// get Book from Server
			console.log('request book', bookId)
			if (feathersClient.io.connected) {
				const book = await feathersClient.service('books').get('' + bookId)
				console.log('request book', book)
				commit('SET_BOOK', book)
			}

			return null
		}
	},
}
export const getters = {
	getBook: (state, getters, rootState, rootGetters) => {
		return (bookId) => {
			const offlineBook = rootGetters['offline/getBook'](bookId)
			console.log('search vbook ' + bookId, offlineBook)
			if (offlineBook) return offlineBook
			console.log('Found book', state.bookMap[bookId])
			return deepClone(state.bookMap[bookId])
		}
	},
}

export const plugin = (store) => {
	feathersClient.service('books').on('patched', (book) => {
		console.log(' book patched', book)
		store.commit('book/SET_BOOK', book)
	})
	// store.subscribe((mutation, state) => {
	// 	// called after every mutation.
	// 	// The mutation comes in the format of `{ type, payload }`.
	// 	if (['auth/LOGGED_IN'].includes(mutation.type)) {
	// 		store.dispatch('progress/getAllUserProgress')
	// 	}
	// })
}
