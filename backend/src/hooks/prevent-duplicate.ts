// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import * as mongoose from 'mongoose'
import { DocumentAlreadyExists } from '../errors'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (
	mongooseCollectionName: string,
	fieldsToCheck: Array<string>,
	options = {}
): Hook => {
	return async (context: HookContext): Promise<HookContext> => {
		const { data } = context
		const Model = await mongoose.model(mongooseCollectionName)
		const query = fieldsToCheck.reduce((acc: any, el: string) => {
			acc[el] = data[el]
			return acc
		}, {})
		const duplicatedDoc = await Model.findOne(query)
		if (duplicatedDoc) {
			throw new DocumentAlreadyExists(duplicatedDoc)
		}

		return context
	}
}
