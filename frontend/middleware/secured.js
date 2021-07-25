export default function ({ store, redirect, route }) {
	const { auth } = store.state
	console.log(route)
	console.log(auth.payload)
	if (
		auth.publicPages.length > 0 &&
		!auth.publicPages.includes(route.name) &&
		!auth.payload
	) {
		return redirect(`/login?to=${route.path}`)
	}
	// If user loggedIn and route is login page redirect
	if (route.name === 'login' && auth.payload) {
		if (route.query.to && route.query.to !== 'login') {
			return redirect(route.query.to)
		} else {
			return redirect('/')
		}
	}
}
