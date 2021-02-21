// ~/plugins/authInit.js
import { CookieStorage } from 'cookie-storage'

const cookieStorage = new CookieStorage()
const cookie = cookieStorage.getItem('feathers-jwt') !== null
const hashTokenAvailable = window.location.hash.indexOf('access_token' > -1)

export default async (context) => {
  if ((!context.app.store.state.auth.user && cookie) || hashTokenAvailable) {
    console.log('Authenticating', context.app.store.state.auth.user)
    await context.app.store
      .dispatch('auth/authenticate')
      .then(() => {
        console.log('Authenticated', context.app.store.state.auth.user)
      })
      .catch((e) => {
        console.error(e)
      })
  }
}
