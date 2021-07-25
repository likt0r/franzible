import Vue from 'vue'
import { deepClone } from '~/tools/helper'

export const state = () => ({
	progressMap: {},
})
export const mutations = {
	SET_PROGRESS(state, progress) {
		Vue.set(state.progressMap, progress.bookId.progress)
	},
}
export const actions = {
	setProgress({ commit }, progress) {
		commit('SET_PROGRESS', progress)
	},
}
export const getters = {
	getProgress: (state) => (bookId) => {
		return deepClone(state.progressMap[bookId])
	},
}
