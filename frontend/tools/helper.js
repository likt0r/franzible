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

export function createObjectURL(object) {
	return window.URL
		? window.URL.createObjectURL(object)
		: window.webkitURL.createObjectURL(object)
	// const blob = new Blob(blobPieces, { type: 'audio/mp3' })
	// if (window.webkitURL) {
	// 	return window.webkitURL.createObjectURL(blob)
	// } else if (window.URL && window.URL.createObjectURL) {
	// 	return window.URL.createObjectURL(blob)
	// } else {
	// 	return null
	// }
}

export function revokeObjectURL(url) {
	return window.URL
		? window.URL.revokeObjectURL(url)
		: window.webkitURL.revokeObjectURL(url)
}

export function readLocalImage(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result)
		}
		reader.onerror = (error) => {
			reject(error)
		}
		reader.readAsDataURL(file)
	})
}
