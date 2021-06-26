import { generate as generateId } from 'shortid'
export const state = () => ({
	items: [],
})
export const mutations = {
	ADD_ITEM(state, item) {
		state.items.push(item)
	},
	REMOVE_ITEM(state, id) {
		const index = state.items.findIndex((item) => item.id === id)

		if (index !== -1) {
			state.items.splice(index, 1)
		}
	},
}
export const actions = {
	showWarning({ commit }, message) {
		commit('ADD_ITEM', {
			id: generateId(),
			color: 'warning',
			message,
		})
	},
	showError({ commit }, message) {
		commit('ADD_ITEM', {
			id: generateId(),
			color: 'error',
			message,
		})
	},
	showInfo({ commit }, message) {
		commit('ADD_ITEM', {
			id: generateId(),
			color: 'info',
			message,
		})
	},
	showSuccess({ commit }, message) {
		commit('ADD_ITEM', {
			id: generateId(),
			color: 'success',
			message,
		})
	},
	hideMessage({ commit }, id) {
		commit('REMOVE_ITEM', id)
	},
}
export const getters = {
	items: (state) => state.items,
}
