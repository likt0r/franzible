import { disallow } from 'feathers-hooks-common'
// Don't remove this comment. It's needed to format import lines nicely.
import { hooks } from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
// import createDelay from '../../hooks/create-delay'
import isAdmin from '../../hooks/is-admin'
import saveBookToJson from '../../hooks/save-book-to-json'
const { authenticate } = hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [ authenticate('jwt'),isAdmin() ],
    update: [ authenticate('jwt'),isAdmin() ],
    patch: [ disallow],
    remove: [ authenticate('jwt'),isAdmin() ],
  },

  after: {
    all: [],
    find: [],
    get: [
      async (context: HookContext): Promise<HookContext> => {
        delete context.result.author_fuzzy
        delete context.result.title_fuzzy
        delete context.result.series_fuzzy
        return context
      },
    ],
    create: [],
    update: [saveBookToJson()],
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
