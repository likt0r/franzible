import Vue from 'vue'
import { deepClone } from '~/tools/helper'
import { feathersClient } from '~/plugins/feathers'
export const state = () => ({
	progressMap: {},
	isSynced: false,
	lastPlayed: { bookId: null, updatedAt: new Date(0).toISOString() },
})

export const mutations = {
	SET_PROGRESS(state, progress) {
		Vue.set(state.progressMap, progress.bookId, progress)
		if (state.lastPlayed.updatedAt < progress.updatedAt) {
			// silent update of last played updateAt value
			state.lastPlayed.updatedAt = progress.updatedAt
			if (state.lastPlayed.bookId !== progress.bookId) {
				state.lastPlayed.bookId = progress.bookId
				// update getters and watchers
				state.lastPlayed = { ...state.lastPlayed }
			}
		}
	},
	PATCH_PROGRESS(
		state,
		{ bookId, fileIndex, filePosition, updatedAt = new Date().toISOString() }
	) {
		if (state.progressMap[bookId]) {
			state.progressMap[bookId].fileIndex = fileIndex
			state.progressMap[bookId].filePosition = filePosition
			state.progressMap[bookId].updatedAt = updatedAt
			// Vue.set(state.progressMap, bookId, {... state.progressMap[bookId]})
			if (Date.parse(state.lastPlayed.updatedAt) < Date.parse(updatedAt)) {
				state.lastPlayed.updatedAt = updatedAt
				if (state.lastPlayed.bookId !== bookId) {
					state.lastPlayed.bookId = bookId
					// update getters and watchers
					//state.lastPlayed = { ...state.lastPlayed }
				}
			}
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
	async create({ commit }, bookId) {
		const result = await feathersClient
			.service('progress')
			.create({ bookId, fileIndex: 0, filePosition: 0 })
		commit('SET_PROGRESS', result)
		return result
	},
	async patch(
		{ commit, state },
		{ bookId, fileIndex, filePosition, updatedAt }
	) {
		commit('PATCH_PROGRESS', { bookId, fileIndex, filePosition })
		const { _id } = state.progressMap[bookId]

		feathersClient.service('progress').patch(_id, {
			fileIndex,
			filePosition,
			updatedAt,
		})
	},
}
export const getters = {
	getProgress: (state) => (bookId) => {
		return deepClone(state.progressMap[bookId])
	},
	isSynced: (state) => state.isSynced,
	lastPlayedBookId: (state) => state.lastPlayed.bookId,
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
