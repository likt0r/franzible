import '@feathersjs/transport-commons'
import { HookContext } from '@feathersjs/feathers'
import { Application } from './declarations'

export default function (app: Application): void {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  app.on('connection', (connection: any): void => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection)
  })

  app.on('login', (authResult: any, { connection }: any): void => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // Obtain the logged in user from the connection
      const user = connection.user

      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection)

      // Add it to the authenticated user channel
      app.channel('public').join(connection)

      // Add it to  admins if user is admin channel
      if (user.isAdmin) {
        app.channel('admins').join(connection)
      }
      // Add user top his private channel
      app.channel(`private/${user._id.toString()}`).join(connection)
    }
  })

  app.on('logout', (payload: any, { connection }: any): void => {
    if (connection) {
      const user = connection.user
      // Join the channels a logged out connection should be in
      app.channel('anonymous').join(connection)
      app.channel('public').leave(connection)
      if (user.isAdmin) {
        app.channel('admins').leave(connection)
      }
      app.channel(`private/${user._id.toString()}`).leave(connection)
    }
  })
}
