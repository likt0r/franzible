export const state = () => ({
	active: false,
	currentTime: 0,
})
export const mutations = {
	SET_CURRENT_TIME(state, time) {
		state.currentTime = time
	},
	SET_ACTIVE_STATE(state, active) {
		state.active = active
	},
}
export const actions = {
	startTimer({ dispatch, commit, getters, state, rootGetters }, time) {
		commit('SET_CURRENT_TIME', time * 60)
		commit('SET_ACTIVE_STATE', true)
	},
	stopTimer({ commit }) {
		commit('SET_CURRENT_TIME', 0)
		commit('SET_ACTIVE_STATE', false)
	},
}
export const getters = {
	getTimeActiveState(state) {
		return state.active
	},
	getCurrentTime(state) {
		return state.currentTime
	},
}
let timer = 0
export const timerInitPlugin = (store) => {
	// called when the store is initialized
	store.subscribe((mutation, state) => {
		if (mutation.type === 'timer/SET_ACTIVE_STATE') {
			if (state.timer.active) {
				if (state.timer.currentTime > 0) {
					// Start timer interval
					timer = setInterval(() => {
						if (
							state.timer.currentTime > 0 ||
							state.timer.currentTime < 0
						) {
							store.commit(
								'timer/SET_CURRENT_TIME',
								state.timer.currentTime - 1
							)
						} else {
							store.commit('timer/SET_CURRENT_TIME', 0)
							store.commit('timer/SET_ACTIVE_STATE', false)
							store.dispatch('player/pause')
						}
					}, 1000)
				}
			} else {
				clearInterval(timer)
			}
		}
		if (
			mutation.type === 'player/SET_FILE' &&
			state.timer.active &&
			state.timer.currentTime < 0
		) {
			// next file is loaded so stop timer
			store.commit('timer/SET_CURRENT_TIME', 0)
			store.commit('timer/SET_ACTIVE_STATE', false)
			store.dispatch('player/pause')
		}
	})
}
