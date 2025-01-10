export class GenericException extends Error {
	public id: string | null = null;
	public error: any;
	public details: Record<string, any> = {};
	public message: string = '';

	constructor(message: string, details = {}) {
		super(message);
		this.name = 'GenericException';
		this.setProps({ error: message, details });
	}

	setProps({ error, details }) {
		this.id = details.id ?? null;
		this.message = error;
		this.details = details ?? {};
	}

	logError() {
		strapi.log.error(this.message);
	}
}

export class ResponseError extends GenericException {
	public status: number;

	constructor(message: string, status: number, details = {}) {
		super(message, details);

		this.name = 'ResponseError';
		this.status = status ?? 500;
	}
}