import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
	// new VuexPersistence({
	// 	storage: window.localStorage,
	// 	reducer: (state) => ({
	// 		progress: {
	// 			progressMap: state.progress.progressMap,
	// 		},
	// 	}),
	// 	filter: (mutation) =>
	// 		mutation.type === 'progress/SET_PROGRESS' ||
	// 		mutation.type === 'progress/PATCH_PROGRESS',
	// }).plugin(store)
}
