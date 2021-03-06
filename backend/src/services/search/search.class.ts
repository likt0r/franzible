import {
  Id,
  NullableId,
  Paginated,
  Params,
  ServiceMethods,
} from '@feathersjs/feathers'
import { Application } from '../../declarations'
import mongoose from 'mongoose'
interface Data {}

interface ServiceOptions {}

export class Search implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find(params?: Params): Promise<Data[] | Paginated<Data>> {
    const Books = mongoose.model('books')
    const query = params?.query
    console.log(query)
    const result = await (Books.find({}) as any)
      .fuzzySearch({ query: query?.term || '', exact: true })
      .select('_id series title author cover files')
      .limit(parseInt(query?.$limit || '20'))
      .skip(parseInt(query?.$skip || '0'))
    return result
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
