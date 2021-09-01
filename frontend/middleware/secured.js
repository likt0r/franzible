import { PUBLIC_PAGES } from '~/tools/consts'

export default function ({ store, redirect, route }) {
	const { auth } = store.state

	if (
		PUBLIC_PAGES.length > 0 &&
		!PUBLIC_PAGES.includes(route.name) &&
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
