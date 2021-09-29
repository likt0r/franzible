export function deepClone(object: any): any {
	if (typeof object === 'undefined') return undefined
	return JSON.parse(JSON.stringify(object))
}
