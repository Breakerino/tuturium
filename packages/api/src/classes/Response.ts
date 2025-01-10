// @ts-ignore
import { DefaultContext } from 'koa';
import { handleResponseError } from '../utils/functions';
import { get, isEmpty, merge } from 'lodash';

class Response {
	// General
	private ctx: DefaultContext | null = null;
	private options = {
		validation: {
			messages: {},
			labels: {},
		},
	};

	// Response
	private data = {};
	private error = {};
	private status = 200;

	constructor(ctx, options = {}) {
		this.ctx = ctx;
		this.options = merge(this.options, options);
	}

	public setData(data, options = { merge: false }) {
		this.data = options.merge ? merge(this.data, data) : data;
	}

	public setStatus(status, override = true) {
		if (!override && this.status !== 200) {
			return;
		}

		this.status = status;
	}

	public hasError() {
		return !isEmpty(this.error);
	}

	public getError(field: string | null = null) {
		return field ? get(this.error, field) : this.error;
	}

	public setError(error: any) {
		// Default
		const response = handleResponseError(error);
		this.error = response.error;
		this.status = response.status;
	}

	public send() {
		return this.ctx?.send({ data: this.data, error: this.error }, this.status);
	}
}

export default Response;