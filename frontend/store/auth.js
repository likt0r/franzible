import { feathersClient } from '~/plugins/feathers'
export const state = () => ({
	payload: null,
	accessToken: null,
	user: null,
	publicPages: ['login', 'library'],
	loggedIn: false,
})

export const mutations = {
	SET_AUTHENTICATION(state, { authentication, user }) {
		state.payload = authentication.payload
		state.accessToken = authentication.accessToken
		state.user = user
	},
	LOGGED_IN(state) {
		state.loggedIn = true
	},
	LOGGED_OUT(state) {
		state.loggedIn = false
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
		commit('LOGGED_IN')
	},
	async reAuthenticate({ commit }) {
		const result = await feathersClient.reAuthenticate()
		commit('SET_AUTHENTICATION', result)
		commit('LOGGED_IN')
	},

	async logout({ commit }) {
		await feathersClient.logout()
		commit('SET_AUTHENTICATION', {
			authentication: { payload: null, accessToken: null },
			user: null,
		})
		commit('LOGGED_OUT')
	},
}

export const getters = {
	isLoggedIn: (state) => !!state.payload,
}

export const plugins = []
