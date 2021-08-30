// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { Forbidden } from '@feathersjs/errors'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { user, query } = context.params
    if (user && user.isAdmin) {
      return context
    } else {
      // check if query for email is set
      if (!(query && query.email)) throw new Forbidden()
    }
    return context
  }
}
