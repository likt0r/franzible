import {
	Id,
	NullableId,
	Paginated,
	Params,
	ServiceMethods,
} from '@feathersjs/feathers'
import { Application } from '../../declarations'
const packageJSON = require('../../../package.json')
interface Data {}

interface ServiceOptions {}

export class SystemInfo implements ServiceMethods<Data> {
	app: Application
	options: ServiceOptions

	constructor(options: ServiceOptions = {}, app: Application) {
		this.options = options
		this.app = app
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async find(params?: Params): Promise<Data[] | Paginated<Data>> {
		return [
			{
				name: packageJSON.name,
				description: packageJSON.description,
				version: packageJSON.version,
			},
		]
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async get(id: Id, params?: Params): Promise<Data> {
		throw new Error('Method not implemented')
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async create(data: Data, params?: Params): Promise<Data> {
		throw new Error('Method not implemented')
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
		throw new Error('Method not implemented')
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
		throw new Error('Method not implemented')
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async remove(id: NullableId, params?: Params): Promise<Data> {
		throw new Error('Method not implemented')
	}
}
