import { Application } from '../declarations'
import fileUpload from './file-upload'
import { Request, Response, NextFunction } from 'express'
import { authenticate } from '@feathersjs/express'
const setSessionAuthentication = (
	req: any,
	res: Response,
	next: NextFunction
) => {
	console.log(req.cookie)
	next()
}

import multer from 'multer'
// Don't remove this comment. It's needed to format import lines nicely.

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export default function (app: Application): void {
	console.log('init middleware')
	const uploadFolder = app.get('uploadFolder')
	const storage = multer.diskStorage({
		destination: (req, file, cb) => cb(null, uploadFolder),
		filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
	})
	const upload = multer({
		storage,
		limits: {
			fieldSize: 1e9, // Max field value size in bytes, here it's 100MB
			fileSize: 1e9, //  The max file size in bytes, here it's 10MB
			// files: the number of files
			// READ MORE https://www.npmjs.com/package/multer#limits
		},
	})
	app.get(
		'/file-upload',
		authenticate('jwt'),
		upload.array('files'),
		fileUpload(app)
	)
}
