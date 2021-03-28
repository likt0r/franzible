import { disallow } from 'feathers-hooks-common'
// Don't remove this comment. It's needed to format import lines nicely.
import { hooks } from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
// import createDelay from '../../hooks/create-delay'

const { authenticate } = hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [disallow('external')],
    update: [disallow('external')],
    patch: [disallow('external')],
    remove: [disallow('external')],
  },

  after: {
    all: [],
    find: [],
    get: [
      async (context: HookContext): Promise<HookContext> => {
        delete context.result.author_fuzzy
        delete context.result.title_fuzzy
        delete context.result.series_fuzzy
        console.log(context.result)
        return context
      },
    ],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
}
