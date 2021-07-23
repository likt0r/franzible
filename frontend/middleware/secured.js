export default async function ({ store, redirect, route }) {
	const { auth } = store.state

	if (!auth.payload && auth.accessToken) {
		await store.dispatch('auth/authenticate')
	}
	if (
		auth.publicPages.length > 0 &&
		!auth.publicPages.includes(route.name) &&
		!auth.payload
	) {
		console.log(route)
		return redirect(`/login?to=${route.path}`)
	} else if (
		auth.publicPages.length > 0 &&
		auth.publicPages.includes(route.name) &&
		auth.payload
	) {
		console.log(route)
		return redirect('/')
	}
}
