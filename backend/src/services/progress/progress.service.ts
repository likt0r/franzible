// Initializes the `progress` service on path `/progress`
import { ServiceAddons } from '@feathersjs/feathers'

import { Application } from '../../declarations'
import { Progress } from './progress.class'
import createModel from '../../models/progress.model'
import hooks from './progress.hooks'

// Add this service to the service type index
declare module '../../declarations' {
	interface ServiceTypes {
		progress: Progress & ServiceAddons<any>
	}
}

export default function (app: Application): void {
	const options = {
		Model: createModel(app),
		paginate: undefined, // app.get('paginate'),
	}

	// Initialize our service with any options it requires
	app.use('/progress', new Progress(options, app))

	// Get our initialized service so that we can register hooks
	const service = app.service('progress')

	service.hooks(hooks)

	service.publish((data, _) => {
		return app.channel(`private/${data.userId.toString()}`)
	})
}
