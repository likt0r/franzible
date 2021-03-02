// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    console.log(context)
    context.result = context.result.map((entry: any) => {
      return Object.assign(
        {
          search: context.params.query
            ? context.params.query.search
            : undefined,
        },
        entry._doc
      )
    })
    return context
  }
}
