// users-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations'
import { MongooseFuzzySearchingField } from 'mongoose-fuzzy-searching/helpers'
import fuzzySearching from 'mongoose-fuzzy-searching'
import { Model, Mongoose } from 'mongoose'
import { mongoosePlugin as timeStamp } from '../tools/timeStamps'
const fields: MongooseFuzzySearchingField<any>[] = [
	{ name: 'author' },
	{ name: 'title' },
	'series',
]

export default function (app: Application): Model<any> {
	const modelName = 'books'
	const mongooseClient: Mongoose = app.get('mongooseClient')
	const schema = new mongooseClient.Schema(
		{
			author: { type: String },
			title: { type: String },
			series: [String],
			files: [{ filepath: String, filename: String, duration: Number }],
			cover: [String],
			genre: { type: String },
			language: { type: String },
			type: { type: String },
			mediaPath: { type: String },
			verified: { type: Boolean, default: false },
		},
		{
			timestamps: true,
		}
	)
	schema.plugin(fuzzySearching, { fields })
	schema.plugin(timeStamp)
	// This is necessary to avoid model compilation errors in watch mode
	// see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
	if (mongooseClient.modelNames().includes(modelName)) {
		mongooseClient.deleteModel(modelName)
	}
	return mongooseClient.model<any>(modelName, schema)
}
