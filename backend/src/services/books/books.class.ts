import { Service, MongooseServiceOptions } from 'feathers-mongoose'
import {
  Id,
  NullableId,
  Paginated,
  Params,
  ServiceMethods,
} from '@feathersjs/feathers'
import * as mongoose from 'mongoose'
import { Application } from '../../declarations'
export class Books extends Service {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options)
  }
  async find(params?: any): Promise<any[] | Paginated<any>> {
    console.log('find params.query:', params.query)
    const Books = mongoose.model('books')
    if (params.query.search && (params.query.search as String).length > 1) {
      const result = await (Books as any).fuzzySearch({
        query: params.query.search,
      })

      return result
    } else {
      console.log('find use parent function')
      const result = await Books.find({})
      return result
    }
  }
}
