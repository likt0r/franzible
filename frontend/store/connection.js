import { feathersClient } from '~/plugins/feathers'

export const state = () => ({
	connected: false,
})
export const mutations = {
	DISCONNECT(state) {
		state.connected = false
	},
	CONNECT(state) {
		state.connected = true
	},
}
export const actions = {}
export const getters = {
	connected: (state) => state.connected,
}

export const plugin = (store) => {
	feathersClient.io.on('connect', () => {
		store.commit('connection/CONNECT')
	})
	feathersClient.io.on('disconnect', () => {
		store.commit('connection/DISCONNECT')
	})
}
