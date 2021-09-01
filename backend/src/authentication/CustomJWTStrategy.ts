import ms from 'ms'
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { JWTStrategy } from '@feathersjs/authentication'
import { Params } from '@feathersjs/feathers'
import { AuthenticationRequest } from '@feathersjs/authentication'

export default class CustomJWTStrategy extends JWTStrategy {
  async authenticate(authentication: AuthenticationRequest, params: Params) {
    const config = this.authentication?.configuration
    const { maximumSessionLength, jwtOptions } = config

    // run all of the original authentication logic, e.g. checking
    // if the token is there, is valid, is not expired, etc.
    const res = await super.authenticate(authentication, params)

    // use the oat date to check if we should regenerate the token
    const now = Date.now()
    const iat = res.authentication.payload.iat * 1000
    const oat = res.authentication.payload.oat * 1000
    const start = startOfDay(now)
    const end = endOfDay(now)

    // regenerate only once per day to avoid "waste"
    // check if this token has been issued today, which
    // would mean we do not need to bother regenerating it
    if (!isWithinInterval(iat, { start, end })) {
      // now check if by regenerating the token, we will
      // not exceed our maximum desired session length
      if (oat + ms(maximumSessionLength) > now + ms(jwtOptions.expiresIn)) {
        // and now the key trick - by deleting the accessToken here
        // we will get Feathers AuthenticationStrategy.create()
        // to generate us a new token, but with the original oat
        // field as specified in out custom getPayload!
        delete res.accessToken
      }
    }

    return res
  }
}
