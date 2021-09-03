import { feathersClient } from '~/plugins/feathers'
export const state = () => ({
	payload: null,
	accessToken: null,
	user: null,
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
		state.payload = null
		state.accessToken = null
		state.user = null
		state.loggedIn = false
	},
}

export const actions = {
	async authenticate({ commit }, { strategy, email, password }) {
		if (feathersClient.io.connected) {
			const result = await feathersClient.authenticate({
				strategy,
				email,
				password,
			})
			console.log('auth/authenticate user_id', result.user._id)
			commit('SET_AUTHENTICATION', result)
			commit('LOGGED_IN')
		}
	},
	async reAuthenticate({ commit }) {
		if (feathersClient.io.connected) {
			try {
				const result = await feathersClient.reAuthenticate()
				commit('SET_AUTHENTICATION', result)
				commit('LOGGED_IN')
			} catch (error) {
				if (
					error.type === 'FeathersError' &&
					error.message === 'No accessToken found in storage'
				) {
					console.warn(error.message)
				} else throw error
			}
		}
	},

	async logout({ commit }, ignoreFeathers) {
		commit('LOGGED_OUT')
		if (!ignoreFeathers) await feathersClient.logout()
		window.localStorage.removeItem('vuex')
		window.location.reload()
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

export const plugin = (store) => {
	feathersClient.io.on('connect', () => {
		store.dispatch('auth/reAuthenticate')
	})
}
