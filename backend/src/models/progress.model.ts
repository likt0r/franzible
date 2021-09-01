// progress-model.ts - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
import { Application } from '../declarations'
import { Model, Mongoose } from 'mongoose'
import { mongoosePlugin as timeStamp } from '../tools/timeStamps'

export default function (app: Application): Model<any> {
  const modelName = 'progress'
  const mongooseClient: Mongoose = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const schema = new Schema({
    userId: { type: mongooseClient.Schema.Types.ObjectId, ref: 'users' },
    bookId: { type: mongooseClient.Schema.Types.ObjectId, ref: 'books' },
    played: { type: Boolean, default: false },
    fileIndex: { type: Number },
    filePosition: { type: Number },
  })
  schema.plugin(timeStamp)
  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    (mongooseClient as any).deleteModel(modelName)
  }
  return mongooseClient.model<any>(modelName, schema)
}
