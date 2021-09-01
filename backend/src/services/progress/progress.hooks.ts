import * as authentication from '@feathersjs/authentication'
// Don't remove this comment. It's needed to format import lines nicely.
import { setField } from 'feathers-authentication-hooks'
import { Hook, HookContext } from '@feathersjs/feathers'
import restrictToUser from '../../hooks/restrict-to-user'
import { preFeathersHook as handleTimestamp } from '../../tools/timeStamps'
const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt'), restrictToUser(), handleTimestamp],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [],
    find: [],
    get: [],
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
