// Use this hook to save data to json.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import fs from 'fs'
import util from 'util'

const writeFile = util.promisify(fs.writeFile);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    console.log(JSON.stringify(context.data))
   //  writeFile
    return context
  }
}
