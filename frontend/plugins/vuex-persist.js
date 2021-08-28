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
			auth: state.auth,
		}),
		filter: (mutation) =>
			mutation.type === 'SET_USER' ||
			mutation.type === 'SET_AUTHENTICATION' ||
			mutation.type === 'LOGGED_IN' ||
			mutation.type === 'LOGGED_OUT' ||
			featherRegExp.test(mutation.type),
	}).plugin(store)
}
