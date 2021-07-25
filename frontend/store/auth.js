import { feathersClient } from '~/plugins/feathers'
export const state = () => ({
	payload: null,
	accessToken: null,
	user: null,
	publicPages: ['login', 'library'],
})

export const mutations = {
	SET_AUTHENTICATION(state, { authentication, user }) {
		state.payload = authentication.payload
		state.accessToken = authentication.accessToken
		state.user = user
	},
}

export const actions = {
	async authenticate({ commit }, { strategy, email, password }) {
		const result = await feathersClient.authenticate({
			strategy,
			email,
			password,
		})
		commit('SET_AUTHENTICATION', result)
		console.log(result)
	},
	async reAuthenticate({ commit }) {
		const result = await feathersClient.reAuthenticate()
		commit('SET_AUTHENTICATION', result)
		console.log(result)
	},

	async logout({ commit }) {
		await feathersClient.logout()
		commit('SET_AUTHENTICATION', {
			authentication: { payload: null, accessToken: null },
			user: null,
		})
	},
}

export const getters = {}

export const plugins = []
