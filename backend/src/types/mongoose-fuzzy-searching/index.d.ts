// Overwrite mongoose Type so fuzzy searching works

declare module 'mongoose-fuzzy-searching'

declare module 'mongoose-fuzzy-searching/helpers' {
	import { Query, Document } from 'mongoose'
	export function nGrams(
		query: string,
		escapeSpecialCharacters: boolean,
		defaultNgamMinSize: number,
		checkPrefixOnly: boolean
	): string[]
	// Types for Mongoose Fuzzy Searching
	export type MongooseFuzzySearchingField<T = any> =
		| keyof T
		| {
				name: keyof T
				minSize?: number
				weight?: number
				prefixOnly?: boolean
				escapeSpecialCharacters?: boolean
				keys?: (string | number)[]
		  }

	export interface MongooseFuzzySearchingMiddlewares<T = unknown> {
		preSave(this: Query<T, Document<any>>): void
		preInsertMany(this: Query<T, Document<any>>): Promise<void>
		preUpdate(this: Query<T, Document<any>>): Promise<void>
		preUpdateOne(): Promise<void>
		preFindOneAndUpdate(this: Query<T, Document<any>>): Promise<void>
		preUpdateMany(this: Query<T, Document<any>>): Promise<void>
	}

	export interface MongooseFuzzySearchingOptions<
		T extends Record<string, unknown>
	> {
		fields?: MongooseFuzzySearchingField<T>[]
		middlewares?: MongooseFuzzySearchingMiddlewares<T>
	}

	export interface MongooseFuzzySearchingParams {
		query: string
		minSize?: string
		prefixOnly?: boolean
		exact?: boolean
	}

	export interface Model<T extends Document> {
		fuzzySearch(query: string | MongooseFuzzySearchingParams): Promise<T[]>
	}
}
