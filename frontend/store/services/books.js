// ~/store/services/books.js
import feathersClient, {
  makeServicePlugin,
  BaseModel,
} from '~/plugins/feathers'
/* eslint-disable */
class Book extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.

  static modelName = 'Book'
  // Define default properties here
  static instanceDefaults() {
    return {
      author: '',
      title: '',
      series: '',
      files: [],
      cover: [''],
    }
  }
}
const servicePath = 'books'
const servicePlugin = makeServicePlugin({
  Model: Book,
  service: feathersClient.service(servicePath),
  servicePath,
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [
      (context) => {
        // if book is offline avaible use offline content
        context.result = context.service.FeathersVuexModel.store.state.offline.books.find(
          (book) => book._id === context.id
        )
        return context
      },
    ],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
})

export default servicePlugin
