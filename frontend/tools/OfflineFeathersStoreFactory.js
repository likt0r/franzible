import Vue from 'vue'
import { nanoid } from 'nanoid'
import { deepClone } from '~/tools/helper'
export default function factory(
	serviceName,
	moduleName,
	feathersClient,
	options
) {
	const { idField, syncAll } = Object.assign(
		{ idField: '_id', syncAll: true },
		options
	)
	return {
		state: {
			documentsMap: {},
			isSynced: false,
			operationsBuffer: [],
		},
		mutations: {
			CREATE(state, { id, doc }) {
				console.log('progress/CREATE mutation', { id, doc })
				Vue.set(state.documentsMap, id, doc)
			},
			PATCH(state, { id, doc }) {
				console.log('progress/PATCH mutation ', { id, doc })
				if (!state.documentsMap[id]) {
					throw new Error(
						`Could not patch doc for id ${id} on service ${serviceName}`
					)
				}
				// prevent changing id
				delete doc[idField]

				Vue.set(
					state.documentsMap,
					id,
					Object.assign({}, state.documentsMap[id], doc)
				)
			},
			REMOVE(state, id) {
				delete state.documentsMap[id]
			},
			SET_SYNCED_STATE(state, value) {
				state.isSynced = value
			},
			REMOVE_OPERATION(state, index) {
				state.operationsBuffer.splice(index, 1)
			},
			ADD_OPERATION(state, { operationType, id, doc }) {
				switch (operationType) {
					case 'patch': {
						// merge all buffered patch operations
						const mergedDoc = state.operationsBuffer
							.filter((operation) => operation.id === id)
							.reduce((acc, operation) => {
								Object.assign(acc, operation.doc)
								return acc
							}, {})
						state.operationsBuffer = state.operationsBuffer.filter(
							(operation) => operation.id !== id
						)
						state.operationsBuffer.push({
							operationType,
							id,
							doc: mergedDoc,
						})
						break
					}
					case 'remove': {
						state.operationsBuffer = state.operationsBuffer.filter(
							(operation) => operation.id !== id
						)
						// if it is still temp doc remove all operations for this doc from buffer
						if (!id.startsWith('temp-')) {
							state.operationsBuffer.push({
								operationType,
								id,
								doc,
							})
						}
						break
					}
					case 'create': {
						state.operationsBuffer.push({
							operationType,
							id,
							doc,
						})
						break
					}
					default:
						throw new Error(`Unkown operation ${operationType}`)
				}
			},
		},
		actions: {
			async sync({ commit, state, rootState }) {
				// TODO: optimise request only get updated progress
				console.log(`Get all: ${serviceName}`, rootState.auth.user)
				const result = await feathersClient
					.service(serviceName)
					.find({ userId: rootState.auth.user._id })
				console.log(`All : ${serviceName}`, result)

				result.forEach((doc) => {
					const id = doc[idField]
					const localDoc = state.documentsMap[id]
					if (!localDoc) {
						commit('CREATE', { id, doc })
					} else if (
						Date.parse(localDoc.updatedAt) < Date.parse(doc.updatedAt)
					) {
						console.log(`${serviceName} sync patch theirs`, doc)
						commit('PATCH', { id, doc })
					} else {
						// if ours  is newer send to them
						console.log(`${serviceName} sync patch ours`, localDoc)
						feathersClient
							.service(serviceName)
							.patch(doc[idField], localDoc)
					}
				})
				commit('SET_SYNCED_STATE', true)
			},
			async create({ commit }, doc) {
				console.log(`${serviceName}/create `, doc)
				try {
					if (!doc.createdAt) {
						doc.createdAt = new Date().toISOString()
						doc.updatedAt = doc.createdAt
					}
					const result = await feathersClient
						.service(serviceName)
						.create(doc)
					console.log(`${serviceName}/create result`, result)
					commit('CREATE', { id: result[idField], doc: result })
					return result
				} catch (error) {
					console.warn('create error', error)
					doc[idField] = `temp-${nanoid()}`
					doc.createdAt = new Date().toISOString()
					doc.updatedAt = doc.createdAt
					commit('ADD_OPERATION', {
						operationType: 'create',
						id: doc[idField],
						doc,
					})
					commit('CREATE', { id: doc[idField], doc })
					return doc
				}
			},
			async patch({ commit }, { id, doc }) {
				try {
					console.log(`/${moduleName}/patch action id, doc`, { id, doc })
					const result = await feathersClient
						.service(serviceName)
						.patch(id, doc)
					console.log(`/${moduleName}/patch action id, result`, result)
					commit('PATCH', { id, doc: result })
					return result
				} catch (error) {
					console.warn('patch error', error)
					doc.updatedAt = new Date().toISOString()
					commit('ADD_OPERATION', {
						operationType: 'patch',
						id,
						doc,
					})
					commit('PATCH', { id, doc })
					return doc
				}
			},
			async remove({ commit }, id) {
				try {
					const result = await feathersClient
						.service(serviceName)
						.remove(id)
					commit('REMOVE', id)
				} catch (error) {
					console.warn('remove error', error)
					commit('ADD_OPERATION', {
						operationType: 'remove',
						id,
					})
					commit('REMOVE', id)
				}
			},
		},
		getters: {
			get: (state) => (id) => deepClone(state.documentsMap[id]),
			isSynced: (state) => state.isSynced,
		},
		plugin: (store) => {
			feathersClient.service(serviceName).on('created', (doc) => {
				console.log(`${moduleName} service event created`, doc)
				store.commit(`${moduleName}/CREATE`, { id: doc[idField], doc })
			})
			feathersClient.service(serviceName).on('patched', (doc) => {
				console.log(`${moduleName} service event patched`, doc)
				store.commit(`${moduleName}/PATCH`, { id: doc[idField], doc })
			})
			feathersClient.service(serviceName).on('removed', (doc) => {
				console.log(`${moduleName} service event removed`, doc)
				store.commit(`${moduleName}/REMOVE`, doc[idField])
			})

			feathersClient.io.on('connect', () => {
				console.log('#socketIO: connected')
				// if (feathersClient.authentication.authenticated) {
				// 	store.dispatch(`${moduleName}/sync`)
				// }
			})

			feathersClient.io.on('disconnect', () => {
				console.log(
					'#socketIO: disconnected',
					feathersClient.authentication
				)
			})

			feathersClient.authentication.app.on('authenticated', () => {
				// Wait for state updating
				setImmediate(() => store.dispatch(`${moduleName}/sync`))
			})
			store.subscribe((mutation, state) => {
				// called after every mutation.
				// The mutation comes in the format of `{ type, payload }`.
			})
		},
	}
}
