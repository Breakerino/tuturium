// @ts-ignore
import { DefaultContext } from 'koa';
import { get, has, omit } from 'lodash';
import { GenericException, ResponseError } from './errors';
import _ from 'lodash';

export const handleResponseError = (error: any | null = null) => {
	if (!(error instanceof GenericException)) {
		return {
			status: 500,
			error: {
				name: 'UnknownError',
				//message: String(error),
				message: error?.message ?? 'An unknown error has occured',
				details: {
					...error?.details,
					code: error?.code,
					status: error.response?.status,
					data: error.response?.data,
				},
			},
		};
	}

	const { id, status, name, message, details } =
		error instanceof GenericException && !(error instanceof ResponseError)
			? new ResponseError(error.message, 400, error.details)
			: error;

	return {
		status: status ?? 400,
		error: { id, name, message, status, details: omit(details, ['id']) },
	};
};

export const sendResponse = (
	{ data = {}, error = {}, status = 200 },
	ctx: DefaultContext
) => {
	return ctx.send({ data, error }, status);
};

export const validateRequestData = async <T>(data: T, requiredFields: Record<string, any>) => {
	for (const [path, type] of Object.entries(requiredFields)) {
		if (!has(data, path)) {
			throw new ResponseError(`Required field "${path}" is missing.`, 400, {
				id: 'missing_required_field',
				data: { path, type },
			});
		}

		const dataValue = get(data, path, null);

		if (typeof dataValue !== type) {
			throw new ResponseError(
				`Required field "${path}" is not a valid type (expected ${type}, got ${typeof dataValue}).`,
				400,
				{
					id: 'invalid_field_type',
					data: { path, type: { expected: type, provided: typeof dataValue } },
				}
			);
		}
	}
};

export const sleep = (ms: number, callback?: () => void): Promise<void> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			if (callback) callback();
			resolve();
		}, ms);
	});
};

export const evaulateCondition = (condition, data) => {
	// Skip condition if given field does not exist on transaction
	if (!_.has(data, condition.field)) {
		return false;
	}

	// Retrieve field value
	let fieldValue = _.get(data, condition.field);
	
	// Make it lowercase string
	fieldValue = String(fieldValue).toLocaleLowerCase();
	
	// Retrieve condition value
	// TODO: Expand placeholder from "data" object (lodash.template)
	let conditionValue = condition.value;
	
	// Make it lowercase string
	conditionValue = String(conditionValue).toLocaleLowerCase();

	switch (condition.operator) {
		case 'CONTAINS':
			if (fieldValue?.includes?.(conditionValue)) {
				return true;
			}
			break;
		case 'NOT CONTAINS':
			if (!fieldValue?.includes?.(conditionValue)) {
				return true;
			}
			break;
		case 'IN':
			if (conditionValue?.split?.('|')?.includes?.(fieldValue)) {
				return true;
			}
			break;
		case 'NOT IN':
			if (!conditionValue?.split?.('|')?.includes?.(fieldValue)) {
				return true;
			}
			break;
		case 'IS':
			if (fieldValue === conditionValue) { // TODO: Only allow string/number types
				return true;
			}
			break;
		case 'NOT':
			if (fieldValue !== conditionValue) { // TODO: Only allow string/number types
				return true;
			}
			break;
		case 'GTE':
			if (Number(fieldValue) >= Number(conditionValue)) { // TODO: Only allow number types
				return true;
			}
			break;
		case 'LTE':
			if (Number(fieldValue) <= Number(conditionValue)) { // TODO: Only allow number types
				return true;
			}
			break;
		case 'GT':
			if (Number(fieldValue) > Number(conditionValue)) { // TODO: Only allow number types
				return true;
			}
		case 'LT':
			if (Number(fieldValue) < Number(conditionValue)) { // TODO: Only allow number types
				return true;
			}
			break;
	}

	return false;
}