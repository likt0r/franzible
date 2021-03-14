// users-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations'
import { Model, Mongoose } from 'mongoose'

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
    },
    {
      timestamps: true,
    }
  )

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName)
  }
  return mongooseClient.model<any>(modelName, schema)
}
