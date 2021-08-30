import VuexPersistence from 'vuex-persist'
const FEATHER_MUTATIONS = [
	'CREATE$',
	'PATCH$',
	'REMOVE$',
	'CHANGE_TEMP_ID',
	'REMOVE_REMOVED_DOC_ID',
	'ADD_REMOVED_DOC_ID',
]
const featherRegExp = new RegExp(`${FEATHER_MUTATIONS.join('|')}$`)
export default ({ store }) => {
	window.$store = store
	new VuexPersistence({
		storage: window.localStorage,
		reducer: (state) => ({
			progress: {
				documentsMap: state.progress.documentsMap,
				removedDocIds: state.progress.removedDocIds,
				lastPlayed: state.progress.lastPlayed,
			},
			auth: {
				payload: state.auth.payload,
				accessToken: state.auth.accessToken,
				user: state.auth.user,
				loggedIn: state.auth.loggedIn,
			},
		}),
		filter: (mutation) => {
			return (
				mutation.type === 'auth/LOGGED_OUT' ||
				mutation.type === 'auth/SET_USER' ||
				mutation.type === 'auth/SET_AUTHENTICATION' ||
				mutation.type === 'auth/LOGGED_IN' ||
				mutation.type === 'progress/SET_LAST_PLAYED' ||
				featherRegExp.test(mutation.type)
			)
		},
	}).plugin(store)
}
