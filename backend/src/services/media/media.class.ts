import {
	Id,
	NullableId,
	Paginated,
	Params,
	ServiceMethods,
} from '@feathersjs/feathers'
import { Application } from '../../declarations'
import * as path from 'path'
import {
	getAudioFiles,
	getImageFiles,
	getDirectories,
	readInfoJson,
} from '../../tools/files'
import * as mongoose from 'mongoose'
import * as mm from 'music-metadata'

interface Data {}

interface ServiceOptions {}

export class Media implements ServiceMethods<Data> {
	app: Application
	options: ServiceOptions
	updating: boolean
	progress: number

	constructor(options: ServiceOptions = {}, app: Application) {
		this.options = options
		this.app = app
		this.updating = false
		this.progress = 0
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async find(params?: Params): Promise<Data[] | Paginated<Data>> {
		throw new Error('Method not implemented')
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async get(id: Id, params?: Params): Promise<Data> {
		switch (id) {
			case 'updating':
				return { value: this.updating, id }
			case 'progress':
				return { value: this.progress, id }
			default:
				throw new Error('Not a valid id')
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async create(data: Data, params?: Params): Promise<Data> {
		throw new Error('Method not implemented')
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
		if (this.updating) return data
		const Books = mongoose.model('books')
		const mediaPath = this.app.get('mediaPath')
		const authors = await getDirectories(mediaPath)
		const service = this.app.service('media-update')
		service.patch('updating', { value: true })
		let foundBooks = []
		try {
			let library: Array<any> = []
			for (const author of authors) {
				library = library.concat(
					(await getDirectories(path.join(mediaPath, author))).map((book) => ({
						author,
						book,
					}))
				)
			}

			for (const [index, { author, book }] of library.entries()) {
				const bookPath = path.join(mediaPath, author, book)

				const fileInfo = await readInfoJson(bookPath)
				let data
				if (fileInfo) {
					data = fileInfo
				} else {
					const audioFiles = await getAudioFiles(bookPath)
					audioFiles.sort() //alphabetical sort
					const splits = book.split(';').map((entry: string) => entry.trim())
					const imageFiles = await getImageFiles(bookPath)
					// read metadata from files
					const files = []
					for (const file of audioFiles) {
						const filepath = path.join(bookPath, file)
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
					console.log('Books ', title)
					data = {
						author: author as string,
						title: title as string,
						series: splits.splice(0, splits.length - 1),
						files,
						cover:
							imageFiles.length > 0
								? path.join('files', author, book, imageFiles[0])
								: null,
						mediaPath: bookPath,
					}
				}
				await Books.updateOne(
					{ author: data.author, title: data.title },
					data,
					{ upsert: true }
				)
				foundBooks.push(bookPath)
				service.patch('progress', { value: (index / library.length) * 100 })
				// add Data File
			}
		} finally {
			service.patch('updating', { value: false })
			service.patch('progress', { value: 0 })
			return []
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async patch(id: NullableId, data: any, params?: Params): Promise<Data> {
		switch (id) {
			case 'updating':
				this.updating = data.value
				return { ...data, id }
			case 'progress':
				this.progress = data.value
				return { ...data, id }
			default:
				throw new Error('Not a valid id')
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async remove(id: NullableId, params?: Params): Promise<Data> {
		throw new Error('Method not implemented')
	}
}
