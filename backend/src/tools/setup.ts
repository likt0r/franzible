import * as mongoose from 'mongoose'
import { Application } from '../declarations'
export async function createAdminAccount(app: Application): Promise<void> {
  const User = await mongoose.model('users')
  const count = await User.estimatedDocumentCount()
  if (count === 0) {
    const service = app.service('users')
    service.create({
      email: 'admin',
      password: 'admin',
      isAdmin: true,
      strategy: 'local',
    })
  }
}
