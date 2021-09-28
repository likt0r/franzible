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
			isSyncing: false,
			getDocIds: [],
			removedDocIds: [],
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
			CHANGE_TEMP_ID(state, { tempId, newDoc }) {
				delete state.documentsMap[tempId]
				state.documentsMap[newDoc[idField]] = newDoc
			},
			REMOVE(state, id) {
				delete state.documentsMap[id]
			},
			SET_SYNCED_STATE(state, value) {
				state.isSynced = value
			},
			SET_SYNCING_STATE(state, value) {
				state.isSyncing = value
			},
			REMOVE_REMOVED_DOC_ID(state, id) {
				state.removedDocIds = state.removedDocIds.filter((el) => el !== id)
			},
			ADD_REMOVED_DOC_ID(state, id) {
				state.removedDocIds.push(id)
			},
			REMOVE_GET_DOC_ID(state, id) {
				state.getDocIds = state.removedDocIds.filter((el) => el !== id)
			},
			ADD_GET_DOC_ID(state, id) {
				state.getDocIds.push(id)
			},
		},
		actions: {
			async sync({ commit, state, rootState }) {
				// TODO: optimise request only get updated progress
				console.log('sync now')
				if (state.isSyncing) {
					return
				}
				console.log(`Sync start: ${serviceName}`)
				try {
					commit('SET_SYNCING_STATE', true)
					// if not sync all get only already requested documents
					const query = syncAll
						? {}
						: {
								_id: {
									$in: Object.keys(state.documentsMap).concat(
										state.getDocIds
									),
								},
						  }

					const result = await feathersClient
						.service(serviceName)
						.find({ query })
					// console.log(`All : ${serviceName}`, result)
					// console.log('docMap', state.documentsMap)

					const serverDocsIds = result.map((doc) => doc[idField])
					const { docsToRemoveServer, docsToUpdate, newServerDocs } =
						result.reduce(
							(acc, doc) => {
								if (state.removedDocIds.includes(doc[idField])) {
									acc.docsToRemoveServer.push(doc)
								} else if (state.documentsMap[doc[idField]]) {
									acc.docsToUpdate.push(doc)
								} else {
									acc.newServerDocs.push(doc)
								}
								return acc
							},
							{
								docsToRemoveServer: [],
								docsToUpdate: [],
								newServerDocs: [],
							}
						)
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
						docsToRemoveServer.map(async (doc) => {
							await feathersClient
								.service(serviceName)
								.remove(doc[idField])
							commit('REMOVE_REMOVED_DOC_ID', doc[idField])
						})
					)

					await Promise.all(
						newLocalDocs.map(async (doc) => {
							// create new local docs on server
							const tempId = doc[idField]
							const tmpDoc = deepClone(doc)
							delete tmpDoc[idField]
							try {
								const result = await feathersClient
									.service(serviceName)
									.create(tmpDoc)
								commit('CHANGE_TEMP_ID', { tempId, newDoc: result })
							} catch (error) {
								const { data } = error
								if (error.name === 'document-already-exists') {
									// TODO: User notification
									commit('CREATE', { id: data[idField], doc: data })
									console.warn(
										'Progress already exists on Server taking server state',
										data
									)
									commit('CHANGE_TEMP_ID', { tempId, newDoc: data })
								} else throw error
							}
						})
					)

					docsToRemoveLocal.forEach((doc) =>
						commit('REMOVE', doc[idField])
					)

					newServerDocs.forEach((doc) => {
						// console.log(`${serviceName} sync create theirs`, localDoc)
						commit('CREATE', { id: doc[idField], doc })
					})

					docsToUpdate.forEach((doc) => {
						const id = doc[idField]
						const localDoc = state.documentsMap[id]
						if (
							Date.parse(localDoc.updatedAt) ===
							Date.parse(doc.updatedAt)
						) {
							// do nothing
						} else if (
							Date.parse(localDoc.updatedAt) < Date.parse(doc.updatedAt)
						) {
							//console.log(`${serviceName} sync patch theirs`, doc)
							commit('PATCH', { id, doc })
						} else {
							// if ours  is newer send to them
							// console.log(`${serviceName} sync patch ours`, localDoc)

							feathersClient
								.service(serviceName)
								.patch(doc[idField], localDoc)
						}
					})
					commit('SET_SYNCING_STATE', false)
					commit('SET_SYNCED_STATE', true)
					console.log(`Sync ended: ${serviceName}`)
				} catch (error) {
					commit('SET_SYNCING_STATE', false)
					throw error
				}
			},
			async create({ commit }, doc) {
				// console.log(`${serviceName}/create `, doc)
				if (feathersClient.io.connected) {
					if (!doc.createdAt) {
						doc.createdAt = new Date().toISOString()
						doc.updatedAt = doc.createdAt
					}
					try {
						const result = await feathersClient
							.service(serviceName)
							.create(doc)
						// console.log(`${serviceName}/create result`, result)
						commit('CREATE', { id: result[idField], doc: result })
						return result
					} catch (error) {
						const { data } = error
						if (error.name === 'document-already-exists') {
							commit('CREATE', { id: data[idField], doc: data })
							// TODO: User notification
							console.warn(
								`Document ${moduleName} already exists on Server, taking server state`,
								data
							)
							return error.data
						} else throw error
					}
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
					try {
						const result = await feathersClient
							.service(serviceName)
							.patch(id, doc)

						// console.log(`/${moduleName}/patch action id, result`, result)
						commit('PATCH', { id, doc: result })
						return result
					} catch (e) {
						console.error(e)
						return null
					}
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
					commit('ADD_REMOVED_DOC_ID', id)
				}
			},
			async get({ commit, state }, id) {
				if (feathersClient.io.connected) {
					console.log(`get doc for id ${id} on service ${serviceName}`)
					const doc = await feathersClient.service(serviceName).get(id)
					if (state.documentsMap[id]) {
						commit('PATCH', { id, doc })
					} else {
						commit('CREATE', { id, doc })
					}
					return doc
				} else {
					commit('ADD_GET_DOC_ID', id)
					return state.documentsMap[id]
				}
			},
		},
		getters: {
			get: (state) => (id) => deepClone(state.documentsMap[id]),
			isSynced: (state) => state.isSynced,
			isSyncing: (state) => state.isSyncing,
		},
		plugin: (store) => {
			feathersClient.service(serviceName).on('created', (doc) => {
				console.log(`${moduleName} service event created`, doc)
				store.commit(moduleName ? `${moduleName}/CREATE` : 'CREATE', {
					id: doc[idField],
					doc,
				})
			})
			feathersClient.service(serviceName).on('patched', (doc) => {
				console.log(`${moduleName} service event patched`, doc)
				if (
					store.state[moduleName].documentsMap[doc[idField]].updatedAt <
					doc.updatedAt
				) {
					store.commit(moduleName ? `${moduleName}/PATCH` : 'PATCH', {
						id: doc[idField],
						doc,
					})
				}
			})
			feathersClient.service(serviceName).on('removed', (doc) => {
				// console.log(`${moduleName} service event removed`, doc)
				store.commit(
					moduleName ? `${moduleName}/REMOVE` : 'REMOVE',
					doc[idField]
				)
			})
			feathersClient.authentication.app.on('authenticated', () => {
				// Wait for state updating
				setImmediate(() => store.dispatch(`${moduleName}/sync`))
			})
		},
	}
}
