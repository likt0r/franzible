import * as mongoose from 'mongoose'
import { Application } from '../declarations'
export async function createAdminAccount(app: Application): Promise<void> {
	const User = await mongoose.model('users')
	const count = await User.estimatedDocumentCount()

	if (count === 0) {
		const authService = (app as any).defaultAuthentication()

		const [localStrategy] = authService.getStrategies('local')

		const hashedPassword = await (localStrategy as any).hashPassword('admin')

		User.create({
			email: 'admin',
			password: hashedPassword,
			isAdmin: true,
			strategy: 'local',
		})
	}
}
