import Vue from 'vue'
import { deepClone } from '~/tools/helper'
import { feathersClient } from '~/plugins/feathers'
import OfflineFeathersStoreFactory from '~/tools/OfflineFeathersStoreFactory'

const {
	state: pState,
	mutations: pMutations,
	actions: pActions,
	getters: pGetters,
	plugin: pPlugin,
} = OfflineFeathersStoreFactory('progress', 'progress', feathersClient)
export const state = () => ({
	...pState,
	lastPlayed: { bookId: null, updatedAt: new Date(0).toISOString() },
})

export const mutations = {
	...pMutations,
	SET_LAST_PLAYED(store, { bookId, updatedAt }) {
		store.lastPlayed = { bookId, updatedAt }
	},
}
export const actions = {
	...pActions,
	async createByBookId({ dispatch }, bookId) {
		if (!bookId) throw new Error('Progress for books need bookId')
		await dispatch('create', {
			bookId,
			fileIndex: 0,
			filePosition: 0,
			played: false,
		})
	},
	patchByBookId({ dispatch, getters }, { bookId, fileIndex, filePosition }) {
		dispatch('patch', {
			id: getters.bookMap[bookId]._id,
			doc: { fileIndex, filePosition },
		})
	},
	inferLastPlayed({ commit, state }) {
		console.log('sync set last Played')
		let lastProgress = null
		Object.values(state.documentsMap).forEach((doc) => {
			if (!lastProgress) {
				lastProgress = doc
			} else if (
				Date.parse(lastProgress.updatedAt) < Date.parse(doc.updatedAt)
			) {
				lastProgress = doc
			}
		})
		if (lastProgress) {
			const { bookId, updatedAt } = lastProgress
			commit('SET_LAST_PLAYED', { bookId, updatedAt })
		}
	},
}
export const getters = {
	...pGetters,
	lastPlayedBookId: (state) => state.lastPlayed.bookId,
	bookMap: (state) => {
		// console.log('progress/getters bookMap', state.documentsMap)
		return Object.values(state.documentsMap).reduce((acc, doc) => {
			acc[doc.bookId] = doc
			return acc
		}, {})
	},

	getByBookId: (_, getters) => (id) => {
		// console.log('progress/getters/getBookId', id)
		return getters.bookMap[id]
	},
}

export const plugin = (store) => {
	pPlugin(store)
	const { dispatch, commit } = store
	store.subscribe((mutation, state) => {
		if (
			mutation.type === 'progress/PATCH' ||
			mutation.type === 'progress/CREATE'
		) {
			const { bookId, updatedAt } = mutation.payload.doc

			if (
				Date.parse(state.progress.lastPlayed.updatedAt) <=
				Date.parse(updatedAt)
			) {
				commit('progress/SET_LAST_PLAYED', { bookId, updatedAt })
			}
		}

		if (
			mutation.type === 'progress/SET_SYNCED_STATE' &&
			mutation.payload === true
		) {
			dispatch('progress/inferLastPlayed')
		}
	})
}

export default {
	state,
	mutations,
	actions,
	getters,
}
