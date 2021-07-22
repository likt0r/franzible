import { ServiceAddons } from '@feathersjs/feathers'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { expressOauth } from '@feathersjs/authentication-oauth'

import CustomAuthenticationService from './CustomAuthenticationService'
import CustomJWTStrategy from './CustomJWTStrategy'

import { Application } from '../declarations'

declare module '../declarations' {
	interface ServiceTypes {
		authentication: CustomAuthenticationService & ServiceAddons<any>
	}
}

export default function (app: Application): void {
	const authentication = new CustomAuthenticationService(app)

	authentication.register('jwt', new CustomJWTStrategy())
	authentication.register('local', new LocalStrategy())

	app.use('/authentication', authentication)
	app.configure(expressOauth())
}
