import { Request, Response, NextFunction } from 'express'
import { Application } from '../declarations'
export default (app: Application) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars

	return (req: Request, res: Response) => {
		console.log(req.feathers)
		const { files } = req
		res.json(files)
	}
}
