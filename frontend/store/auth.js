import { feathersClient } from '~/plugins/feathers'
export const state = () => ({
	payload: null,
	accessToken: null,
	user: null,
	publicPages: ['login', 'library'],
	loggedIn: false,
})

export const mutations = {
	SET_USER(state, user) {
		state.user = user
	},
	SET_AUTHENTICATION(state, { authentication, user }) {
		console.log('SET_AUTHENTICATION ', user)
		state.payload = authentication.payload
		state.accessToken = authentication.accessToken
		state.user = { ...user }
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
		console.log('auth/authenticate user_id', result.user._id)
		commit('SET_AUTHENTICATION', result)
		commit('LOGGED_IN')
	},
	async reAuthenticate({ commit }) {
		const result = await feathersClient.reAuthenticate()
		console.log('auth/reAuthenticate user_id', result.user._id)
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

	async patchUser({ commit, state }, { email, password, retyped }) {
		const result = await feathersClient
			.service('users')
			.patch(state.user._id, { email, password, retyped })
		console.log(result)
	},
}

export const getters = {
	isLoggedIn: (state) => !!state.payload,
}

export const plugins = []
