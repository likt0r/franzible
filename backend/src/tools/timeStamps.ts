import { Schema } from 'mongoose'
import { Hook, HookContext, Id } from '@feathersjs/feathers'
import { ieNoOpen } from 'helmet'

export function mongoosePlugin(schema: Schema) {
	schema.add({
		createdAt: { type: Date, default: Date.now },
		updatedAt: { type: Date, default: Date.now },
	})
}

export async function preFeathersHook(
	context: HookContext
): Promise<HookContext> {
	const { app, method, result, id, data, params } = context
	const errorMessage =
		'Date is in the Future! Set correct system time of your machine and try again!'
	const errorNewerVersion = 'Your document version is outdated!'
	if (['patch'].includes(method)) {
		// allow writing update < current server time and only if current object is not newer

		// prevent altering creation date
		delete data.createdAt

		if (!data.updatedAt) {
			// if not set Set It
			data.updatedAt = Date.now()
		} else {
			data.updatedAt = Date.parse(data.updatedAt)
		}
		// check if date is not in future
		if (data.updated > Date.now()) {
			throw new Error(errorMessage)
		}
		// check if current doc in database is newer
		const current = await context.service.get(id as Id, params)
		if (Date.parse(current.updatedAt) >= data.updatedAt) {
			throw new Error(errorNewerVersion)
		}
		return context
	}
	if (['create'].includes(method)) {
		if (!data.createdAt) {
			data.createdAt = new Date().toISOString()
		}
		// check if date is not in future
		if (Date.parse(data.createdAt) > Date.now()) {
			throw new Error(errorMessage)
		}
		data.updatedAt = data.createdAt
		console.log('create ', context.data)
	}
	//  writeFile
	return context
}
