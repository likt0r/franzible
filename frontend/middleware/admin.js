// ~/middleware/admin.js
export default function ({ store, redirect }) {
  const { auth } = store.state
  if (!auth.payload || !auth.user.isAdmin) {
    return redirect('/')
  }
}
