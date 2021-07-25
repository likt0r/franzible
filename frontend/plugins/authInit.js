// ~/plugins/authInit.js
import { CookieStorage } from 'cookie-storage'

const cookieStorage = new CookieStorage()
const cookie = cookieStorage.getItem('feathers-jwt') !== null
const hashTokenAvailable = window.location.hash.includes('access_token')

// If there is a cookie set re authenticate
export default async (context) => {
	if ((!context.app.store.state.auth.user && cookie) || hashTokenAvailable) {
		await context.app.store.dispatch('auth/reAuthenticate')
	}
}
