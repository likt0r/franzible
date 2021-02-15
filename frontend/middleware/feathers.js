export default async function ({ store, redirect, route }) {
  const { auth } = store.state
  console.log(auth)
  if (!auth.payload && auth.accessToken) {
    await store.dispatch('auth/authenticate')
  }
  if (
    auth.publicPages.length > 0 &&
    !auth.publicPages.includes(route.name) &&
    !auth.payload
  ) {
    return redirect('/login')
  } else if (
    auth.publicPages.length > 0 &&
    auth.publicPages.includes(route.name) &&
    auth.payload
  ) {
    return redirect('/')
  }
}
