declare module 'mongoose-fuzzy-searching' {
  import { Schema, Document, Model } from 'mongoose'
  function mongooseFuzzySearching(
    schema: Schema<Document<any>>,
    model: Model<Document<any>>,
    opts?: any
  ): any
  export = mongooseFuzzySearching
}
