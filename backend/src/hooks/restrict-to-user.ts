// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, method, result, params, data } = context
    const { user, query } = context.params
    if (['find', 'get', 'remove'].includes(method)) {
      if (query && user) {
        query.userId = user._id.toString()
      } else {
        throw new BadRequest('Query or User not defined')
      }
    }
    if (['create', 'patch'].includes(method)) {
      if (data && user) {
        data.userId = user._id.toString()
      } else {
        throw new BadRequest('Data or User not defined')
      }
    }

    return context
  }
}
