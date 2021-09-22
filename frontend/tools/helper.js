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

export function uniqBy(a, key) {
	const seen = {}
	return a.filter(function (item) {
		const k = key(item)
		// eslint-disable-next-line
		return seen.hasOwnProperty(k) ? false : (seen[k] = true)
	})
}

export async function unlockAudio() {
	console.log('unlock audio')
	const elAudio = new Audio()
	elAudio.play()
	elAudio.src = 'test.mp3'
	await elAudio.play()
	console.log('unlock done Playing')
}
