import feathers from 'feathers'
import Vue from 'vue'
import { feathersClient } from '~/plugins/feathers'
import { deepClone } from '~/tools/helper'

export const state = () => ({
	progressMap: {},
	isSynced: false,
})

export const mutations = {
	SET_PROGRESS(state, progress) {
		Vue.set(state.progressMap, progress.bookId, progress)
	},
	PATCH_PROGRESS(state, { bookId, fileIndex, filePosition }) {
		if (state.progressMap[bookId]) {
			state.progressMap[bookId].fileIndex = fileIndex
			state.progressMap[bookId].filePosition = filePosition
			state.progressMap[bookId].updatedAt = new Date().toISOString()
			// Vue.set(state.progressMap, bookId, {... state.progressMap[bookId]})
		} else {
			throw new Error(`Could not patch progress for bookid ${bookId}`)
		}
	},
	SET_SYNCED_STATE(state, value) {
		state.isSynced = value
	},
}
export const actions = {
	async syncProgress({ commit, state, rootState }) {
		// TODO: optimise request only get updated progress
		console.log('Get all user progress:')
		const result = await feathersClient
			.service('progress')
			.find({ userId: rootState.auth.user._id })
		console.log('All user progress:', result)

		result.forEach((bookProgress) => {
			const localProgress = state.progressMap[bookProgress.bookId]
			if (
				!localProgress ||
				Date.parse(localProgress.updatedAt) <
					Date.parse(bookProgress.updatedAt)
			) {
				commit('SET_PROGRESS', bookProgress)
			} else {
				// if check if incomming is newer
				const { fileIndex, filePosition, played } = bookProgress
				feathersClient.service('progress').patch(bookProgress._id, {
					fileIndex,
					filePosition,
				})
			}
		})
		commit('SET_SYNCED_STATE', true)
	},
	async create({ commit, state }, bookId) {
		await feathersClient.service('progress').create({
			bookId,
			fileIndex: 0,
			filePosition: 0,
		})
	},
	async patch({ commit, state }, { bookId, fileIndex, filePosition }) {
		commit('PATCH_PROGRESS', { bookId, fileIndex, filePosition })
		const { _id } = state.progressMap[bookId]
		console.log('_id' + _id)
		feathersClient.service('progress').patch(_id, {
			fileIndex,
			filePosition,
		})
	},
}
export const getters = {
	getProgress: (state) => (bookId) => {
		return deepClone(state.progressMap[bookId])
	},
	isSynced: (state) => state.isSynced,
}

export const plugin = (store) => {
	feathersClient.service('progress').on('created', (progress) => {
		console.log('New progress created', progress)
		store.commit('progress/SET_PROGRESS', progress)
	})
	feathersClient.service('progress').on('patched', (progress) => {
		console.log(' progress patched', progress)
		store.commit('progress/SET_PROGRESS', progress)
	})
	store.subscribe((mutation, state) => {
		// called after every mutation.
		// The mutation comes in the format of `{ type, payload }`.
	})
}
