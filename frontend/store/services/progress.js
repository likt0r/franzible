// ~/store/services/progress.js
import feathersClient, {
	makeServicePlugin,
	BaseModel,
} from '~/plugins/feathers'
/* eslint-disable */
class Progress extends BaseModel {
	constructor(data, options) {
		super(data, options)
	}
	// Required for $FeathersVuex plugin to work after production transpile.

	static modelName = 'Progress'
	// Define default properties here
	static instanceDefaults() {
		return {
			bookId: null,
			fileIndex: 0,
			position: 0,
		}
	}
}
const servicePath = 'progress'
const servicePlugin = makeServicePlugin({
	Model: Progress,
	service: feathersClient.service(servicePath),
	servicePath,
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
	before: {
		all: [],
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
})

export default servicePlugin
