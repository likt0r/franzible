// ~/store/index.js
import { playerInitPlugin } from './player'
import { timerInitPlugin } from './timer'
import {
  makeAuthPlugin,
  initAuth,
  hydrateApi,
  models,
} from '~/plugins/feathers'
const auth = makeAuthPlugin({
  userService: 'users',
  state: {
    publicPages: ['login', 'signup'],
  },
  actions: {
    onInitAuth({ state, dispatch }, payload) {
      if (payload) {
        dispatch('authenticate', {
          strategy: 'jwt',
          accessToken: state.accessToken,
        })
          .then((result) => {
            // handle success like a boss
            console.log('loged in')
          })
          .catch((error) => {
            // handle error like a boss
            console.log(error)
          })
      }
    },
  },
})

const requireModule = require.context(
  // The path where the service modules live
  './services',
  // Whether to look in subfolders
  false,
  // Only include .js files (prevents duplicate imports`)
  /.js$/
)
const servicePlugins = requireModule
  .keys()
  .map((modulePath) => requireModule(modulePath).default)

export const modules = {
  // Custom modules
}

export const state = () => ({
  fileListState: false,
  searchTerm: '1984',
})

export const mutations = {
  SET_FILE_LIST(state, fileListState) {
    state.fileListState = fileListState
  },
  SET_SEARCH(state, searchTerm) {
    state.searchTerm = searchTerm
  },
}

export const actions = {
  // Custom actions
  setSearch({ commit }, searchTerm) {
    commit('SET_SEARCH', searchTerm)
  },
  nuxtServerInit({ commit, dispatch }, { req }) {
    return initAuth({
      commit,
      dispatch,
      req,
      moduleName: 'auth',
      cookieName: 'feathers-jwt',
    })
  },
  nuxtClientInit({ state, dispatch, commit }, context) {
    hydrateApi({ api: models.api })

    if (state.auth.accessToken) {
      return dispatch('auth/onInitAuth', state.auth.payload)
    }
  },
  toggleFileList({ commit, state }) {
    commit('SET_FILE_LIST', !state.fileListState)
  },
}

export const getters = {
  // Custom getters
  fileListState(state) {
    return state.fileListState
  },
}

export const plugins = [
  ...servicePlugins,
  auth,
  playerInitPlugin,
  timerInitPlugin,
]
