import {
	AuthenticationService,
	AuthenticationResult,
	AuthenticationRequest,
} from '@feathersjs/authentication'

interface Params {
	authenticated?: boolean
	authentication?: AuthenticationRequest
}

export default class CustomAuthenticationService extends AuthenticationService {
	async getPayload(authResult: AuthenticationResult, params: Params) {
		const { authentication } = authResult

		// oat – the original issuing timestamp
		// reuse oat if we're authenticating with an existing jwt
		// generate a new timestamp if we're creating a brand new jwt
		let oat

		// authentication.payload is the payload of successfully decoded existing jwt token
		if (
			authentication.strategy === 'jwt' &&
			authentication.payload &&
			authentication.payload.oat
		) {
			oat = authentication.payload.oat
		} else {
			oat = Math.round(Date.now() / 1000)
		}

		return { ...super.getPayload(authResult, params), oat }
	}
}
