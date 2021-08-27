import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import offlineFeathersStoreFactory from '~/tools/OfflineFeathersStoreFactory'
import { createMockedFeathersClient, createDoc } from '~/test/helpers'
import { deepClone } from '~/tools/helper'
import { nanoid } from 'nanoid'
describe('Test OfflineFeatherStoreFactory Mutations', () => {
	let pluginStore
	beforeEach(() => {
		pluginStore = offlineFeathersStoreFactory(
			'testService',
			undefined,
			createMockedFeathersClient(),
			{ idField: 'id' }
		)
	})
	// state: {
	//    documentsMap: {},
	//    isSynced: false,
	//    operationsBuffer: [],
	// },
	it('test create', () => {
		const doc = createDoc({})
		const state = pluginStore.state
		pluginStore.mutations.CREATE(state, { id: doc.id, doc })
		expect(state.documentsMap[doc.id]).toBe(doc)
	})
	it('test remove', () => {
		const doc = createDoc({})
		const state = pluginStore.state
		state.documentsMap[doc.id] = doc
		pluginStore.mutations.REMOVE(state, { id: doc.id })
		expect(state.documentsMap[doc.id]).toBe(doc)
	})
	it('test patch', () => {
		const doc = createDoc({ payload: 1 })
		const state = pluginStore.state
		state.documentsMap[doc.id] = doc
		const alteredDoc = deepClone(doc)
		alteredDoc.payload = 2
		pluginStore.mutations.PATCH(state, { id: doc.id, doc: alteredDoc })
		expect(state.documentsMap[doc.id].payload).toBe(2)
	})
	it('test CHANGE_TEMP_ID', () => {
		const doc = createDoc({ payload: 1 }, true)
		const tempId = doc.id
		const state = pluginStore.state
		state.documentsMap[doc.id] = doc
		const alteredDoc = deepClone(doc)
		alteredDoc.id = nanoid()
		pluginStore.mutations.CHANGE_TEMP_ID(state, {
			tempId,
			newDoc: doc.id,
			newDoc: alteredDoc,
		})
		expect(state.documentsMap[tempId]).toBe(undefined)
		expect(state.documentsMap[alteredDoc.id]).toBe(alteredDoc)
	})
})

describe('Test OfflineFeatherStoreFactory Actions', () => {
	let pluginStore, localVue, mockedFeathersClient
	beforeEach(() => {
		mockedFeathersClient = createMockedFeathersClient()
		pluginStore = offlineFeathersStoreFactory(
			'testService',
			undefined,
			mockedFeathersClient,
			{ idField: 'id' }
		)
		localVue = createLocalVue()
		localVue.use(Vuex)
	})
	it('test create disconnected', async () => {
		mockedFeathersClient.io.connected = false
		const store = new Vuex.Store(pluginStore)
		const result = await store.dispatch('create', { payload: 1 })
		expect(result.id.startsWith('temp-')).toBe(true)
		expect(store.state.documentsMap[result.id].payload).toBe(1)
	})
	it('test create connected', async () => {
		mockedFeathersClient.io.connected = true
		const store = new Vuex.Store(pluginStore)
		const result = await store.dispatch('create', { payload: 1 })

		expect(result.id).toBeTruthy()
		expect(store.state.documentsMap[result.id].payload).toBe(1)

		expect(
			mockedFeathersClient.service('test').create.mock.calls[0][0].payload
		).toBe(1)
	})
	it('test patch disconnected', () => {
		mockedFeathersClient.io.connected = false
		const doc = createDoc({ payload: 1 })
		pluginStore.state.documentsMap[doc.id] = doc
		const store = new Vuex.Store(pluginStore)
		const alteredDoc = deepClone(doc)
		alteredDoc.payload = 2
		store.dispatch('patch', { id: doc.id, doc: alteredDoc })
		expect(store.state.documentsMap[doc.id].payload).toBe(2)
	})
	it('test patch connected', async () => {
		mockedFeathersClient.io.connected = true
		const doc = createDoc({ payload: 1 })
		pluginStore.state.documentsMap[doc.id] = doc
		const store = new Vuex.Store(pluginStore)
		const alteredDoc = deepClone(doc)
		alteredDoc.payload = 2
		await store.dispatch('patch', { id: alteredDoc.id, doc: alteredDoc })
		expect(store.state.documentsMap[alteredDoc.id].payload).toBe(2)

		expect(mockedFeathersClient.service('test').patch.mock.calls[0][0]).toBe(
			alteredDoc.id
		)
		expect(
			mockedFeathersClient.service().patch.mock.calls[0][1].payload
		).toBe(2)
	})

	it('test remove disconnected', async () => {
		mockedFeathersClient.io.connected = false
		const doc = createDoc({ payload: 1 })
		pluginStore.state.documentsMap[doc.id] = doc
		const store = new Vuex.Store(pluginStore)

		await store.dispatch('remove', doc.id)
		expect(store.state.documentsMap[doc.id]).toBe(undefined)
		expect(Object.keys(store.state.removedDocIds).length).toBe(1)
	})
	it('test remove connected', async () => {
		mockedFeathersClient.io.connected = true
		const doc = createDoc({ payload: 1 })
		pluginStore.state.documentsMap[doc.id] = doc
		const store = new Vuex.Store(pluginStore)

		await store.dispatch('remove', doc.id)
		expect(store.state.documentsMap[doc.id]).toBe(undefined)

		expect(mockedFeathersClient.service('test').remove.mock.calls[0][0]).toBe(
			doc.id
		)
	})
	it('test sync server creation', async () => {
		mockedFeathersClient.io.connected = true

		const docs = [
			createDoc({ payload: 1 }, true),
			createDoc({ payload: 2 }, true),
			createDoc({ payload: 3 }, true),
		]

		docs.forEach((doc) => {
			pluginStore.state.documentsMap[doc.id] = doc
		})
		pluginStore.state.auth = { user: { _id: 'userID' } }
		const store = new Vuex.Store(pluginStore)
		await store.dispatch('sync')
		expect(
			Object.keys(store.state.documentsMap).filter((id) =>
				id.startsWith('temp-')
			).length
		).toBe(0)
		expect(mockedFeathersClient.service().create.mock.calls.length).toBe(3)
	})
	it('test sync local creation', async () => {
		mockedFeathersClient.io.connected = true

		const docs = [
			createDoc({ payload: 1 }),
			createDoc({ payload: 2 }),
			createDoc({ payload: 3 }),
		]

		pluginStore.state.auth = { user: { _id: 'userID' } }
		const store = new Vuex.Store(pluginStore)
		mockedFeathersClient.setFindResult(docs)

		await store.dispatch('sync')
		expect(Object.keys(store.state.documentsMap).length).toBe(3)
		expect(mockedFeathersClient.service().create.mock.calls.length).toBe(0)
	})
	it('test sync local remove', async () => {
		mockedFeathersClient.io.connected = false

		const docs = [
			createDoc({ payload: 1 }, false),
			createDoc({ payload: 2 }, false),
			createDoc({ payload: 3 }, false),
		]
		mockedFeathersClient.setFindResult(deepClone(docs))

		docs.forEach((doc) => {
			pluginStore.state.documentsMap[doc.id] = doc
		})
		pluginStore.state.auth = { user: { _id: 'userID' } }
		const store = new Vuex.Store(pluginStore)
		const removedId = docs[0].id
		await store.dispatch('remove', removedId)

		mockedFeathersClient.io.connected = true
		await store.dispatch('sync')
		expect(Object.keys(store.state.documentsMap).length).toBe(2)

		expect(mockedFeathersClient.service().remove.mock.calls.length).toBe(1)
		expect(mockedFeathersClient.service().remove.mock.calls[0][0]).toBe(
			removedId
		)
		expect(Object.keys(store.state.removedDocIds).length).toBe(0)
	})
	it('test sync server remove', async () => {
		mockedFeathersClient.io.connected = true
		pluginStore.state.auth = { user: { _id: 'userID' } }
		const docs = [
			createDoc({ payload: 1 }, false),
			createDoc({ payload: 2 }, false),
			createDoc({ payload: 3 }, false),
		]
		mockedFeathersClient.setFindResult([deepClone(docs[0])])
		docs.forEach((doc) => {
			pluginStore.state.documentsMap[doc.id] = doc
		})

		const store = new Vuex.Store(pluginStore)

		await store.dispatch('sync')
		expect(Object.keys(store.state.documentsMap).length).toBe(1)
		expect(Object.keys(store.state.documentsMap)[0]).toBe(docs[0].id)
	})
	it('test sync local patch', async () => {
		mockedFeathersClient.io.connected = false
		const yesterday = new Date(Date.now() - 8640000000).toISOString()
		const docs = [
			createDoc(
				{ payload: 1, updatedAt: yesterday, createdAt: yesterday },
				false
			),
			createDoc({ payload: 2 }, false),
			createDoc({ payload: 3 }, false),
		]
		mockedFeathersClient.setFindResult(deepClone(docs))

		docs.forEach((doc) => {
			pluginStore.state.documentsMap[doc.id] = doc
		})
		pluginStore.state.auth = { user: { _id: 'userID' } }
		const store = new Vuex.Store(pluginStore)
		const patchedId = docs[0].id
		await store.dispatch('patch', { id: patchedId, doc: { payload: 5 } })

		mockedFeathersClient.io.connected = true
		await store.dispatch('sync')
		expect(Object.keys(store.state.documentsMap).length).toBe(3)

		expect(mockedFeathersClient.service().patch.mock.calls.length).toBe(1)
		expect(mockedFeathersClient.service().patch.mock.calls[0][0]).toBe(
			patchedId
		)
		expect(
			mockedFeathersClient.service().patch.mock.calls[0][1].payload
		).toBe(5)
	})
	it('test sync server patch', async () => {
		mockedFeathersClient.io.connected = true
		const yesterday = new Date(Date.now() - 8640000000).toISOString()
		const docs = [
			createDoc({ payload: 1 }, false),
			createDoc({ payload: 2 }, false),
			createDoc(
				{ payload: 3, updatedAt: yesterday, createdAt: yesterday },
				false
			),
		]
		docs.forEach((doc) => {
			pluginStore.state.documentsMap[doc.id] = doc
		})
		const result = deepClone(docs)
		result[2].updatedAt = new Date().toISOString()
		result[2].payload = 5
		mockedFeathersClient.setFindResult(result)
		pluginStore.state.auth = { user: { _id: 'userID' } }
		const store = new Vuex.Store(pluginStore)
		const patchedId = docs[2].id

		await store.dispatch('sync')
		expect(Object.keys(store.state.documentsMap).length).toBe(3)
		expect(store.state.documentsMap[patchedId].payload).toBe(5)
		expect(mockedFeathersClient.service().patch.mock.calls.length).toBe(0)
	})

	it('test service events', async () => {
		mockedFeathersClient.io.connected = true
		const yesterday = new Date(Date.now() - 8640000000).toISOString()
		const doc = createDoc(
			{ payload: 3, updatedAt: yesterday, createdAt: yesterday },
			false
		)

		pluginStore.state.auth = { user: { _id: 'userID' } }
		const store = new Vuex.Store(pluginStore)
		pluginStore.plugin(store)
		const eMap = mockedFeathersClient.getEventListenerMap()
		expect(eMap.created.length).toBe(1)
		expect(eMap.patched.length).toBe(1)
		expect(eMap.removed.length).toBe(1)
		mockedFeathersClient.dispatchEvent('created', deepClone(doc))
		expect(Object.keys(store.state.documentsMap).length).toBe(1)
		expect(Object.values(store.state.documentsMap)[0].id).toBe(doc.id)
		const patchedDoc = deepClone(doc)
		patchedDoc.payload = 5
		patchedDoc.updatedAt = new Date().toISOString()
		mockedFeathersClient.dispatchEvent('patched', patchedDoc)
		expect(Object.values(store.state.documentsMap)[0].payload).toBe(5)
		mockedFeathersClient.dispatchEvent('removed', patchedDoc)
		expect(Object.keys(store.state.documentsMap).length).toBe(0)
	})
})
