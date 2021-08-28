import VuexPersistence from 'vuex-persist'
const FEATHER_MUTATIONS = [
	'CREATE$',
	'PATCH$',
	'REMOVE$',
	'CHANGE_TEMP_ID',
	'REMOVE_REMOVED_DOC_ID',
	'ADD_REMOVED_DOC_ID',
]
const featherRegExp = new RegExp(`/${FEATHER_MUTATIONS.join('|')}$`)
export default ({ store }) => {
	window.$store = store
	new VuexPersistence({
		storage: window.localStorage,
		reducer: (state) => ({
			progress: {
				documentMap: state.progress.documentMap,
				removedDocIds: state.progress.removedDocIds,
			},
			auth: {
				payload: state.auth.payload,
				accessToken: state.auth.accessToken,
				user: state.auth.user,
				loggedIn: state.auth.loggedIn,
			},
		}),
		filter: (mutation) =>
			mutation.type === 'auth/LOGGED_OUT' ||
			mutation.type === 'auth/SET_USER' ||
			mutation.type === 'auth/SET_AUTHENTICATION' ||
			mutation.type === 'auth/LOGGED_IN' ||
			featherRegExp.test(mutation.type),
	}).plugin(store)
}
