import Vue from 'vue'
import { feathersClient } from '~/plugins/feathers'
import { deepClone } from '~/tools/helper'
import OfflineFeathersStoreFactory from '~/tools/OfflineFeathersStoreFactory'

const {
	state: pState,
	mutations: pMutations,
	actions: pActions,
	getters: pGetters,
	plugin: pPlugin,
} = OfflineFeathersStoreFactory('books', 'books', feathersClient, {
	idField: '_id',
	syncAll: false,
})

export const state = () => ({
	...pState,
})
export const mutations = {
	...pMutations,
}
export const actions = {
	...pActions,
}
export const getters = {
	...pGetters,
	getBook: (state, getters, rootState, rootGetters) => {
		return (bookId) => {
			const offlineBook = rootGetters['offline/getBook'](bookId)
			console.log('search vbook ' + bookId, offlineBook)
			if (offlineBook) return offlineBook
			console.log('Found book', state.documentsMap[bookId])
			return deepClone(state.documentsMap[bookId])
		}
	},
}

export const plugin = pPlugin
