const { FeathersError } = require('@feathersjs/errors')

export class DocumentAlreadyExists extends FeathersError {
	constructor(data: any) {
		super(
			'Document already exists on server',
			'document-already-exists',
			409,
			'DocumentAlreadyExists',
			data
		)
	}
}
