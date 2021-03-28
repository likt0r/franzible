// ~/store/index.js
import { playerInitPlugin } from './player'
import { timerInitPlugin } from './timer'
import { offlineInitPlugin } from './offline'
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
  searchTerm: '',
  searchRequestLimit: 15,
  searchRequestSkip: 0,
  searchResult: [],
  searchRequestThrottle: null,
  searchRequestPending: false,
  searchRequestEndReached: false,
  showNavigationDrawer: false,
  searchScrollPosition: 0,
})

export const mutations = {
  SET_FILE_LIST(state, fileListState) {
    state.fileListState = fileListState
  },
  SET_SEARCH_TERM(state, searchTerm) {
    state.searchTerm = searchTerm
  },
  SET_SHOW_NAVIGATION_DRAWER(state, showNavigationDrawer) {
    console.log('mutations', showNavigationDrawer)
    state.showNavigationDrawer = showNavigationDrawer
  },
  SET_SEARCH_REQUEST_SKIP(state, value) {
    state.searchRequestSkip = value
  },
  SET_SEARCH_REQUEST_THROTTLE(state, timer) {
    state.searchRequestThrottle = timer
  },
  SET_SEARCH_REQUEST_PENDING(state, pending) {
    state.searchRequestPending = pending
  },
  SET_SEARCH_RESULT(state, result) {
    state.searchResult = result
  },
  SET_SEARCH_REQUEST_END_REACHED(state, status) {
    state.searchRequestEndReached = status
  },
  SET_SEARCH_SCROLL_POSITION(state, position) {
    state.searchScrollPosition = position
  },
}

export const actions = {
  // Custom actions
  setSearchScrollPosition({ commit }, position) {
    commit('SET_SEARCH_SCROLL_POSITION', position)
  },
  setShowNavigationDrawer({ commit }, showNavigationDrawer) {
    console.log('hello ', showNavigationDrawer)
    commit('SET_SHOW_NAVIGATION_DRAWER', showNavigationDrawer)
  },
  setSearchTerm({ commit, dispatch, state }, searchTerm) {
    commit('SET_SEARCH_TERM', searchTerm)
    if (state.searchRequestThrottle) {
      clearTimeout(state.searchRequestThrottle)
    }
    commit('SET_SEARCH_RESULT', [])
    commit('SET_SEARCH_REQUEST_SKIP', 0)
    commit('SET_SEARCH_REQUEST_END_REACHED', false)
    commit(
      'SET_SEARCH_REQUEST_THROTTLE',
      setTimeout(() => {
        dispatch('requestSearchApi', state.searchTerm)
        commit('SET_SEARCH_REQUEST_THROTTLE', null)
      }, 800)
    )
  },
  async requestSearchApi({ commit, state }) {
    console.log('requestSearch', state.searchTerm)
    if (!state.searchRequestEndReached) {
      const response = await this.$axios('/api/search', {
        method: 'get',
        headers: {
          Authorization: `Bearer ${state.auth.accessToken}`,
        },
        params: {
          term: state.searchTerm,
          $skip: state.searchRequestSkip,
          $limit: state.searchRequestLimit,
        },
      })

      console.log('response length', response.data.length)
      console.log(response)
      if (response.data.length > 0) {
        commit('SET_SEARCH_RESULT', state.searchResult.concat(response.data))
        commit(
          'SET_SEARCH_REQUEST_SKIP',
          state.searchRequestSkip + state.searchRequestLimit
        )
      } else {
        commit('SET_SEARCH_REQUEST_END_REACHED', true)
      }
    }
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
  getSearchTerm(state) {
    return state.searchTerm
  },
  getShowNavigationDrawer(state) {
    return state.showNavigationDrawer
  },
  getSearchResult(state) {
    return state.searchResult
  },
  getRequestPending(state) {
    return state.searchRequestPending
  },
  getSearchScrollPosition(state) {
    return state.searchScrollPosition
  },
}

export const plugins = [
  ...servicePlugins,
  auth,
  playerInitPlugin,
  timerInitPlugin,
  offlineInitPlugin,
]
