import { nanoid } from 'nanoid'

export function createMockedFeathersClient() {
	const create = jest.fn((doc) => {
		doc.id = nanoid()

		return doc
	})
	const patch = jest.fn((id, doc) => {
		doc.updatedAt = new Date().toISOString()
		return doc
	})
	const remove = jest.fn()
	return {
		io: {
			connected: false,
		},
		service(serviceName) {
			return {
				create,
				patch,
				remove,
			}
		},
	}
}
export function createDoc({ createdAt, updatedAt, payload }) {
	const date = new Date().toISOString()
	const up = typeof updatedAt === 'undefined' ? date : updateAt
	const cr = typeof createdAt === 'undefined' ? date : updateAt
	return { id: nanoid(), updatedAt: up, createdAt: cr, payload }
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
