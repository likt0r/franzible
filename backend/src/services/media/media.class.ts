import {
  Id,
  NullableId,
  Paginated,
  Params,
  ServiceMethods,
} from '@feathersjs/feathers'
import { Application } from '../../declarations'
import * as path from 'path'
import { getAudioFiles, getImageFiles, getDirectories } from '../../tools/files'
import * as mongoose from 'mongoose'
import * as mm from 'music-metadata'

interface Data {}

interface ServiceOptions {}

export class Media implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async find(params?: Params): Promise<Data[] | Paginated<Data>> {
    const Books = mongoose.model('books')
    const mediaPath = this.app.get('mediaPath')
    const authors = await getDirectories(mediaPath)

    for (const author of authors) {
      const books = await getDirectories(path.join(mediaPath, author))
      for (const book of books) {
        const splits = book.split(';').map((entry) => entry.trim())

        const audioFiles = await getAudioFiles(
          path.join(mediaPath, author, book)
        )
        audioFiles.sort() //alphabetical sort
        const imageFiles = await getImageFiles(
          path.join(mediaPath, author, book)
        )
        // read metadata from files
        const files = []
        for (const file of audioFiles) {
          const filepath = path.join(mediaPath, author, book, file)
          const metadata = await mm.parseFile(filepath, {
            duration: true,
            skipCovers: true,
          })
          files.push({
            filename: file,
            filepath: path.join('files', author, book, file),
            duration: metadata.format.duration,
          })
        }

        const title = splits[splits.length - 1]
        await Books.updateOne(
          { author, title },
          {
            author,
            title,
            series: splits.splice(0, splits.length - 1),
            files,
            cover:
              imageFiles.length > 0
                ? path.join('files', author, book, imageFiles[0])
                : null,
          },
          { upsert: true }
        )
      }
    }
    return []
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(id: Id, params?: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    return data
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }
}
