import { disallow } from 'feathers-hooks-common'
// Don't remove this comment. It's needed to format import lines nicely.
import { hooks } from '@feathersjs/authentication'

import isAdmin from '../../hooks/is-admin'

const { authenticate } = hooks

export default {
	before: {
		all: [],
		find: [disallow('external')],
		get: [authenticate('jwt'), isAdmin()],
		create: [disallow('external')],
		update: [authenticate('jwt'), isAdmin()],
		patch: [disallow('external')],
		remove: [disallow('external')],
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
