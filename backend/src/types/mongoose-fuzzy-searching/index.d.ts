// Overwrite mongoose Type so fuzzy searching works

declare module 'mongoose-fuzzy-searching'

declare module 'mongoose-fuzzy-searching/helpers' {
	export function nGrams(
		query: string,
		escapeSpecialCharacters: boolean,
		defaultNgamMinSize: number,
		checkPrefixOnly: boolean
	): string[]
}
