// Use this hook to save data to json.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { deepClone } from '../tools/helpers'
import fs from 'fs'
import util from 'util'
import path from 'path'
const writeFile = util.promisify(fs.writeFile)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
	return async (context: HookContext): Promise<HookContext> => {
		const book = context.data

		const data = deepClone(book)
		delete data.__v
		delete data.updatedAt
		delete data._id
		await writeFile(
			path.join(data.mediaPath, 'info.json'),
			JSON.stringify(data, null, 2)
		)

		//  writeFile
		return context
	}
}
