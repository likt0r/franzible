import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import offlineFeathersStoreFactory from '~/tools/OfflineFeathersStoreFactory'
import { createMockedFeathersClient, createDoc } from '~/test/helpers'
import { deepClone } from '~/tools/helper'
describe('Test OfflineFeatherStoreFactory Mutations', () => {
	let pluginStore
	beforeEach(() => {
		pluginStore = offlineFeathersStoreFactory(
			'testService',
			'testModule',
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
})

describe('Test OfflineFeatherStoreFactory Actions', () => {
	let pluginStore, localVue, mockedFeathersClient
	beforeEach(() => {
		;(mockedFeathersClient = createMockedFeathersClient()),
			(pluginStore = offlineFeathersStoreFactory(
				'testService',
				'testModule',
				mockedFeathersClient,
				{ idField: 'id' }
			))
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
})
