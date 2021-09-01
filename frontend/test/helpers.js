import { nanoid } from 'nanoid'

export function createMockedFeathersClient() {
	let _result = []
	const create = jest.fn((doc) => {
		doc.id = nanoid()
		return doc
	})
	const patch = jest.fn((id, doc) => {
		doc.updatedAt = new Date().toISOString()
		return doc
	})
	const remove = jest.fn()

	const find = jest.fn(() => JSON.parse(JSON.stringify(_result)))
	const eventListenerMap = {
		removed: [],
		patched: [],
		created: [],
		connect: [],
		disconnect: [],
		authenticated: [],
	}
	const on = jest.fn((eventName, listener) => {
		if (eventListenerMap[eventName])
			eventListenerMap[eventName].push(listener)
		else throw new Error(`Unknown event name ${eventName}`)
	})
	return {
		io: {
			connected: false,
			on: on,
		},
		authentication: {
			app: {
				on,
			},
		},
		service(serviceName) {
			return {
				create,
				patch,
				remove,
				find,
				on,
			}
		},
		setFindResult(result) {
			_result = result
		},
		dispatchEvent(eventName, payload) {
			if (eventListenerMap[eventName])
				eventListenerMap[eventName].forEach((listener) => listener(payload))
			else throw new Error(`Unknown event name ${eventName}`)
		},
		getEventListenerMap() {
			return eventListenerMap
		},
	}
}
export function createDoc({ createdAt, updatedAt, payload }, test) {
	const date = new Date().toISOString()
	const up = typeof updatedAt === 'undefined' ? date : updatedAt
	const cr = typeof createdAt === 'undefined' ? date : updatedAt
	return {
		id: test ? `temp-${nanoid()}` : nanoid(),
		updatedAt: up,
		createdAt: cr,
		payload,
	}
}

// await feathersClient
// .service(serviceName)
// .find({ userId: rootState.auth.user._id })

// const result = await feathersClient
// 							.service(serviceName)

// 							.create(tmpDoc)

//                      feathersClient
// 							.service(serviceName)
// 							.patch(doc[idField], localDoc)

//                      f (feathersClient.io.connected) {
//                         if (!doc.createdAt) {
//                            doc.createdAt = new Date().toISOString()
//                            doc.updatedAt = doc.createdAt

//                            feathersClient.service(serviceName).on('created', (doc) => {
