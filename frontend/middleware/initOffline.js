export default async function ({ store }) {
	if (!store.getters['offline/initialized']) {
		await store.dispatch('offline/initialize')
	}
}
