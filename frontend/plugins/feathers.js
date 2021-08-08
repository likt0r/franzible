// ~/plugins/feathers.js
import feathers from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import axios from 'axios'
import socketio from '@feathersjs/socketio-client'
import auth from '@feathersjs/authentication-client'
import io from 'socket.io-client'
import { CookieStorage } from 'cookie-storage'
// Get the api url from the environment variable
const apiUrl = process.env.API_URL
const apiSocket = process.env.API_SOCKET
let socket
let restClient
// We won't use socket to communicate from server to server
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

export const feathersClient = feathers()
	.configure(transport)
	.configure(auth({ storage }))

export default ({ app }, inject) => {
	// Inject $hello(msg) in Vue, context and store.

	inject('feathers', feathersClient)
}
