// users-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations'
import { MongooseFuzzySearchingField } from 'mongoose'
import fuzzySearching from 'mongoose-fuzzy-searching'
import { Model, Mongoose } from 'mongoose'

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
      mediaPath: {type: String}

    },
    {
      timestamps: true,
    }
  )
  schema.plugin(fuzzySearching, { fields })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model<any>(modelName, schema)
}
