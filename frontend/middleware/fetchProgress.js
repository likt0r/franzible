export default async function ({ store, redirect, route }) {
	if (
		!store.getters['progress/isSynced'] &&
		store.getters['auth/isLoggedIn']
	) {
		await store.dispatch('progress/syncProgress')
	}
}
