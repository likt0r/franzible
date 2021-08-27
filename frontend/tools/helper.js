export function deepClone(object) {
	if (typeof object === 'undefined') return undefined
	return JSON.parse(JSON.stringify(object))
}

export function waitSyncEnded(store, moduleName) {
	return new Promise(function (resolve, reject) {
		let unsubscribe = () => {}
		function done() {
			unsubscribe()
			resolve()
		}
		unsubscribe = store.subscribe((mutation, state) => {
			if (mutation.type === `${moduleName}/SET_SYNCING_STATE`) {
				if (!state[moduleName].isSyncing) {
					done()
				}
			}
			// called after  every mutation.
			// The mutation comes in the format of `{ type, payload }`.
		})
	})
}
