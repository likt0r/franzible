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
				// console.log(`${moduleName}/CREATE mutation`, { id, doc })
				Vue.set(state.documentsMap, id, doc)
			},
			PATCH(state, { id, doc }) {
				const _doc = deepClone(doc)
				// console.log(`${moduleName}/PATCH mutation `, { id, doc })
				if (!state.documentsMap[id]) {
					throw new Error(
						`Could not patch doc for id ${id} on service ${serviceName}`
					)
				}
				// prevent changing id
				delete _doc[idField]

				Vue.set(
					state.documentsMap,
					id,
					Object.assign({}, state.documentsMap[id], _doc)
				)
			},
			CHANGE_TEMP_ID(state, { tempId, newDoc }) {},
			REMOVE(state, id) {
				delete state.documentsMap[id]
			},
			SET_SYNCED_STATE(state, value) {
				state.isSynced = value
			},
			REMOVE_OPERATION(state, index) {
				state.operationsBuffer.splice(index, 1)
			},
		},
		actions: {
			async sync({ commit, state, rootState }) {
				// TODO: optimise request only get updated progress
				// console.log(`Sync: ${serviceName}`, rootState.auth.user)
				const result = await feathersClient
					.service(serviceName)
					.find({ userId: rootState.auth.user._id })
				// console.log(`All : ${serviceName}`, result)
				// console.log('docMap', state.documentsMap)

				const serverDocsIds = result.map((doc) => doc[idField])
				const { newLocalDocs, docsToRemoveLocal } = Object.values(
					state.documentsMap
				).reduce(
					(acc, doc) => {
						if (doc[idField].startsWith('temp-')) {
							acc.newLocalDocs.push(doc)
						} else if (!serverDocsIds.includes(doc[idField])) {
							acc.docsToRemoveLocal.push(doc)
						}

						return acc
					},
					{ newLocalDocs: [], docsToRemoveLocal: [] }
				)

				// console.log('sync new Docs ', newLocalDocs)
				// console.log('sync docs to remove', docsToRemoveLocal)

				await Promise.all(
					newLocalDocs.map(async (doc) => {
						// create new local docs on server
						const tempId = doc[idField]
						const tmpDoc = deepClone(doc)
						delete tmpDoc[idField]
						const result = await feathersClient
							.service(serviceName)
							.create(tmpDoc)
						commit('CHANGE_TEMP_ID', { tempId, doc: result })
					})
				)

				docsToRemoveLocal.forEach((doc) => commit('REMOVE', doc[idField]))

				result.forEach((doc) => {
					const id = doc[idField]
					const localDoc = state.documentsMap[id]

					if (!localDoc) {
						// console.log(`${serviceName} sync create theirs`, localDoc)
						commit('CREATE', { id, doc })
					} else if (
						Date.parse(localDoc.updatedAt) < Date.parse(doc.updatedAt)
					) {
						// console.log(`${serviceName} sync patch theirs`, doc)
						commit('PATCH', { id, doc })
					} else {
						// if ours  is newer send to them
						// console.log(`${serviceName} sync patch ours`, localDoc)
						feathersClient
							.service(serviceName)
							.patch(doc[idField], localDoc)
					}
				})
				commit('SET_SYNCED_STATE', true)
			},
			async create({ commit }, doc) {
				// console.log(`${serviceName}/create `, doc)
				if (feathersClient.io.connected) {
					if (!doc.createdAt) {
						doc.createdAt = new Date().toISOString()
						doc.updatedAt = doc.createdAt
					}
					const result = await feathersClient
						.service(serviceName)
						.create(doc)
					// console.log(`${serviceName}/create result`, result)
					commit('CREATE', { id: result[idField], doc: result })
					return result
				} else {
					doc[idField] = `temp-${nanoid()}`
					doc.createdAt = new Date().toISOString()
					doc.updatedAt = doc.createdAt

					commit('CREATE', { id: doc[idField], doc })
					return doc
				}
			},
			async patch({ commit, state }, { id, doc }) {
				// console.log('Patch', feathersClient)

				if (feathersClient.io.connected) {
					// console.log(`/${moduleName}/patch action id, doc`, { id, doc })
					const result = await feathersClient
						.service(serviceName)
						.patch(id, doc)
					// console.log(`/${moduleName}/patch action id, result`, result)
					commit('PATCH', { id, doc: result })
					return result
				} else {
					delete doc[idField]

					doc.updatedAt = new Date().toISOString()

					commit('PATCH', {
						id,
						doc: Object.assign({}, state.documentsMap[id], doc),
					})
					return doc
				}
			},
			async remove({ commit }, id) {
				if (feathersClient.io.connected) {
					const result = await feathersClient
						.service(serviceName)
						.remove(id)
					commit('REMOVE', id)
				} else {
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
				// console.log(`${moduleName} service event created`, doc)
				store.commit(`${moduleName}/CREATE`, { id: doc[idField], doc })
			})
			feathersClient.service(serviceName).on('patched', (doc) => {
				// console.log(`${moduleName} service event patched`, doc)
				store.commit(`${moduleName}/PATCH`, { id: doc[idField], doc })
			})
			feathersClient.service(serviceName).on('removed', (doc) => {
				// console.log(`${moduleName} service event removed`, doc)
				store.commit(`${moduleName}/REMOVE`, doc[idField])
			})

			feathersClient.io.on('connect', () => {
				// console.log('#socketIO: connected')
				// if (feathersClient.authentication.authenticated) {
				// 	store.dispatch(`${moduleName}/sync`)
				// }
			})

			feathersClient.io.on('disconnect', () => {
				// console.log('#socketIO: disconnected',feathersClient.authentication)
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
