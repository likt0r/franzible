import Vue from 'vue'
import { deepClone } from '~/tools/helper'
import { feathersClient } from '~/plugins/feathers'

export const state = () => ({
	updating: false,
	progress: 0,
})

export const mutations = {
	SET_MEDIA_UPDATING(state, value) {
		state.updating = value
	},
	SET_MEDIA_PROGRESS(state, value) {
		state.progress = value
	},
}
export const actions = {
	async updateMedia({ state }) {
		if (feathersClient.io.connected && !state.updating) {
			await feathersClient.service('media-update').update('books', {})
		}
	},
	async updateState({ commit }) {
		if (feathersClient.io.connected) {
			const updating = await feathersClient
				.service('media-update')
				.get('updating')

			commit('SET_MEDIA_UPDATING', updating.value)
			const progress = await feathersClient
				.service('media-update')
				.get('progress')
			commit('SET_MEDIA_PROGRESS', progress.value)
		}
	},
}
export const getters = {
	updating: (state) => state.updating,
	progress: (state) => state.progress,
}

export const plugin = (store) => {
	console.log('#Media patch init')
	feathersClient.service('media-update').on('patched', ({ id, value }) => {
		console.log('#Media patched ' + id, value)
		switch (id) {
			case 'updating':
				store.commit('media/SET_MEDIA_UPDATING', value)
				break
			case 'progress':
				store.commit('media/SET_MEDIA_PROGRESS', value)
				break
			default:
				throw new Error('Not a valid id')
		}
	})
	feathersClient.authentication.app.on('authenticated', () => {
		// Wait for state updating
		setImmediate(() => store.dispatch('media/updateState'))
	})
	// store.subscribe((mutation, state) => {
	// 	// called after every mutation.
	// 	// The mutation comes in the format of `{ type, payload }`.
	// 	if (['auth/LOGGED_IN'].includes(mutation.type)) {
	// 		store.dispatch('progress/getAllUserProgress')
	// 	}
	// })
}

export default {
	state,
	mutations,
	actions,
	getters,
	plugin,
}
