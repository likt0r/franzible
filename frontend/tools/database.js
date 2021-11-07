import Dexie from 'dexie'
import { getFullUrl } from '~/tools/url'
import { createObjectURL } from '~/tools/helper'
// Database inherits from the Dexie class to handle all database logic for the
// Book app.
// NOTE: For an app like this where the database interactions are pretty
// simple, it's not strictly necessary to subclass Dexie, but I personally
// prefer the subclassing pattern over having a global Dexie database class
// in order to structure all the database logic in a single class.

// {  Structure of book
//       author: { type: String },
//       title: { type: String },
//       series: [String],
//       files: [{ filepath: String, filename: String, duration: Number }],
//       cover: [String],
// }

export class Database extends Dexie {
	constructor() {
		// run the super constructor Dexie(databaseName) to create the IndexedDB
		// database.
		super('database')

		// create the books store by passing an object into the stores method. We
		// declare which object fields we want to index using a comma-separated
		// string; the ++ for the index on the id field indicates that "id" is an
		// auto-incrementing primary key, while the "done" field is just a regukar
		// IndexedDB index.
		this.version(1).stores({
			books: '++id,_id,title',
			files: '++id',
		})

		// we can retrieve our books store with Dexie.table, and then use it as a
		// field on our Database class for convenience; we can now write code such
		// as "this.books.add(...)" rather than "this.table('books').add(...)"
		this.books = this.table('books')
		this.files = this.table('files')
	}

	// getbooks retrieves all books from the books object store in a defined
	// order; order can be:
	// - forwardOrder to get the books in forward chronological order
	// - reverseOrder to get the books in reverse chronological order
	// - unfinishedFirstOrder to get the books in reverse chronological order
	async getBooks(order) {
		// In Dexie, we create queries by chaining methods, such as orderBy to
		// sort by an indexed field, and reverse to reverse the order we retrieve
		// data in. The toArray method returns a promise that resolves to the array
		// of the items in the books store.
		let books = []
		switch (order) {
			case forwardOrder:
				books = await this.books.orderBy('title').toArray()
				break
			case reverseOrder:
				books = await this.books.orderBy('title').reverse().toArray()
				break
			default:
				// as a default just fall back to forward order
				books = await this.books.orderBy('id').toArray()
		}

		// The reason we need to modify the done field on each Book is because in
		// IndexedDB, integers can be indexed, but booleans cannot, so we represent
		// "done" status as an integer. Only the database logic needs to know that
		// detail, though, so for convenience when we return the books, their "done"
		// status is a boolean.
		return books.map((t) => {
			t.done = !!t.done
			return t
		})
	}

	// addBook adds a Book with the text passed in to the books object store.
	// Returns a promise that resolves if the addition is successful.
	async addBook(book) {
		// add a Book by passing in an object using Table.add.
		if (await this.isBookInDb(book._id)) return
		return this.books.add(book)
	}

	async updateBook(book) {
		return this.books.update(book.id, book)
	}

	// deleteBook deletes a Book with the ID passed in from the books object
	// store. Returns a promise that resolves if the deletion is successful.
	deleteBook(bookId) {
		// delete a Book by passing in the ID of that Book.
		console.log('deleteBook', bookId)
		return this.books.delete(bookId)
	}

	async isBookInDb(bookId) {
		console.log('isBookInDb', this.books)
		return !!(await this.books.get({ _id: bookId }))
	}

	deleteFile(fileId) {
		// delete a Book by passing in the ID of that Book.
		return this.files.delete(fileId)
	}

	// Download and store an file
	async downloadAndAddFile({ filepath, filename }, { abortSignal }) {
		const res = await fetch(getFullUrl(filepath), { signal: abortSignal })

		const content = await res.blob()
		// Store the binary data in indexedDB:
		return await this.files.add({
			filename,
			content,
		})
	}

	async getFileContentUrl(fileId) {
        console.log('getFileContentUrl fileId',fileId)
		const file = await this.files.get({
			id: fileId,
		})
		const url = createObjectURL(file.content)
        console.log('getFileContentUrl object url',url)
		return url
	}
}

// forwardOrder is passed into getbooks to retrieve books in chronological
// order.
export const forwardOrder = 'forward'

// reverseOrder is passed into getbooks to retrieve books in reverse
// chronological order.
export const reverseOrder = 'reverse'

let database = null
export function getDatabase() {
	if (!database) {
		database = new Database()
	}
	return database
}
