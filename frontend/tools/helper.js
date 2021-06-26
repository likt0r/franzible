export function deepClone(object) {
	if (typeof object === 'undefined') return undefined
	return JSON.parse(JSON.stringify(object))
}
