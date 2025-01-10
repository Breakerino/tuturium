import { omit, template } from 'lodash';

// @ts-ignore
export const formatValidationError = (error, { messages }) => {
	// @ts-ignore
	const formatMessage = (content, data) => template(content, {
		evaluate: /\{\{(.+?)\}\}/g,
		interpolate: /\{\{(.+?)\}\}/g,
		escape: /\{\{-(.+?)\}\}/g,
	})(data);

	const field = {
		...omit(error.params, ['value', 'originalValue', 'path']),
	};

	return error?.type in messages ? formatMessage(messages[error.type], { field }) : null;
}