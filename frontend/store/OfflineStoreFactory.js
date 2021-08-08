import Vue from 'vue'
import { nanoid } from 'nanoid'
import { deepClone } from '~/tools/helper'
export default function factory(
	serviceName,
	moduleName,
	feathersClient,
	{ idField = 'id', syncAll }
) {
	return {
		state: {
			documentMap: {},
			isSynced: false,
			operationsBuffer: [],
		},
		mutations: {
			CREATE(state, doc) {
				Vue.set(state.documentMap, doc[idField], doc)
			},
			PATCH(state, id, doc) {
				if (!state.documentMap[id]) {
					throw new Error(
						`Could not patch doc for id ${id} on service ${serviceName}`
					)
				}
				// prevent changing id
				delete doc[idField]
				Vue.set(
					state.documentMap,
					id,
					Object.merge({}, state.documentMap[id], doc)
				)
			},
			REMOVE(state, id) {
				delete state.documentMap[id]
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
				console.log('Get all user progress:')
				const result = await feathersClient
					.service('progress')
					.find({ userId: rootState.auth.user._id })
				console.log('All user progress:', result)

				result.forEach((bookProgress) => {
					const localProgress = state.progressMap[bookProgress.bookId]
					if (
						!localProgress ||
						Date.parse(localProgress.updatedAt) <
							Date.parse(bookProgress.updatedAt)
					) {
						commit('SET_PROGRESS', bookProgress)
					} else {
						// if check if incoming is newer
						const { fileIndex, filePosition, played } = bookProgress
						feathersClient.service('progress').patch(bookProgress._id, {
							fileIndex,
							filePosition,
						})
					}
				})
				commit('SET_SYNCED_STATE', true)
			},
			async create({ commit }, doc) {
				try {
					const result = await feathersClient
						.service('progress')
						.create(doc)
					commit('SET_PROGRESS', result)
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
					commit('SET_PROGRESS', doc)
					return doc
				}
			},
			async patch({ commit }, { id, doc }) {
				try {
					const result = await feathersClient
						.service('progress')
						.patch(id, doc)
					commit('PATCH_PROGRESS', id, result)
					return result
				} catch (error) {
					console.warn('patch error', error)
					doc.updatedAt = new Date().toISOString()
					commit('ADD_OPERATION', {
						operationType: 'patch',
						id,
						doc,
					})
					commit('PATCH_PROGRESS', id, doc)
					return doc
				}
			},
			async remove({ commit }, id) {
				try {
					const result = await feathersClient
						.service('progress')
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
			gets: (state) => (id) => deepClone(state.documentMap[id]),
			isSynced: (state) => state.isSynced,
		},
		plugin: (store) => {
			feathersClient.service(serviceName).on('created', (doc) => {
				console.log(`${moduleName} created`, doc)
				store.commit(`${moduleName}/create`, doc)
			})
			feathersClient.service(serviceName).on('patched', (doc) => {
				console.log(`${moduleName} patched`, doc)
				store.commit(`${moduleName}/patch`, doc)
			})
			feathersClient.service(serviceName).on('removed', (doc) => {
				console.log(`${moduleName} removed`, doc)
				store.commit(`${moduleName}/remove`, doc[idField])
			})

			feathersClient.io.on('connect', () => {
				console.log('#socketIO: connected')
				if (feathersClient.authentication.authenticated) {
					store.dispatch(`${moduleName}/sync`)
				}
			})

			feathersClient.io.on('disconnect', () => {
				console.log('#socketIO: connected')
				if (feathersClient.authentication.authenticated) {
					store.dispatch(`${moduleName}/sync`)
				}
			})

			feathersClient.authentication.app.on('authenticated', () =>
				store.dispatch(`${moduleName}/sync`)
			)
			store.subscribe((mutation, state) => {
				// called after every mutation.
				// The mutation comes in the format of `{ type, payload }`.
			})
		},
	}
}
