// ~/plugins/feathers.js
import feathers from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import axios from 'axios'
import socketio from '@feathersjs/socketio-client'
import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'
import { CookieStorage } from 'cookie-storage'
import { iff, discard } from 'feathers-hooks-common'
import feathersVuex, { initAuth, hydrateApi } from 'feathers-vuex'
// Get the api url from the environment variable
const apiUrl = process.env.API_URL
const apiSocket = process.env.API_SOCKET
let socket
let restClient
// We won't use socket to comunicate from server to server
if (process.client) {
  socket = io(apiSocket, {
    transports: ['websocket'],
    path: '/api.socket.io',
  })
} else {
  restClient = rest(apiUrl)
}
const transport = process.client
  ? socketio(socket, { timeout: 60000 })
  : restClient.axios(axios)
const storage = new CookieStorage({
  path: '/',
  sameSite: 'Strict',
})

const feathersClient = feathers()
  .configure(transport)
  .configure(auth({ storage }))
  .hooks({
    before: {
      all: [
        iff(
          (context) => ['create', 'update', 'patch'].includes(context.method),
          discard('__id', '__isTemp')
        ),
      ],
    },
  })

export default feathersClient

// Setting up feathers-vuex
const {
  makeServicePlugin,
  makeAuthPlugin,
  BaseModel,
  models,
  FeathersVuex,
} = feathersVuex(feathersClient, {
  serverAlias: 'api', // optional for working with multiple APIs (this is the default value)
  idField: '_id', // Must match the id field in your database table/collection
  whitelist: ['$regex', '$options'],
  enableEvents: process.client, // Prevent memory leak
})

export {
  makeAuthPlugin,
  makeServicePlugin,
  BaseModel,
  models,
  FeathersVuex,
  initAuth,
  hydrateApi,
}
