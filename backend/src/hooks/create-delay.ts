// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (time: number, options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(context)
      }, 0)
    })
  }
}
