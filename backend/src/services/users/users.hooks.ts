import * as feathersAuthentication from '@feathersjs/authentication'
import * as local from '@feathersjs/authentication-local'
import { preFeathersHook as handleTimestamp } from '../../tools/timeStamps'
import isAdmin from '../../hooks/is-admin'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks
const { hashPassword, protect } = local.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [isAdmin()],
    get: [],
    create: [isAdmin(), hashPassword('password')],
    update: [hashPassword('password')],
    patch: [hashPassword('password')],
    remove: [isAdmin()],
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password'),
    ],
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
