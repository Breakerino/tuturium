//
import { has, isEmpty, isObject, omit, set } from 'lodash'
import React from 'react'
import { FieldValues, Validate } from 'react-hook-form'
import { Schema } from 'yup'
import { formatValidationError } from '../functions'

export interface UseValidationResolverProps {
	schema: Schema
	messages: Record<string, string>
}

// @ts-ignore
const useValidationResolver = ({ schema, messages }) => {
	return React.useCallback(
		// @ts-ignore
		async (data, context, options) => {
			let errors = {};

			// Yup validation
			try {
				await schema.validate(data, {
					abortEarly: false,
					stripUnknown: false,
					strict: false,
				})
			} catch (validationResult) {
				// @ts-ignore
				for (const error of validationResult.inner) {
					set(errors, error.path, { id: error.type, type: "validation", message: formatValidationError(error, { messages }) })
				}
			}

			// Custom validation
			for (const [path, field] of Object.entries<any>(options.fields)) {
				if (has(errors, path)) {
					continue;
				}

				if (isEmpty(field?.validate) || !isObject(field?.validate)) {
					continue;
				}

				for (const validationCallback of Object.values<Validate<any, FieldValues>>(field.validate)) {
					const validationResult = await validationCallback(field.value, data);

					if (validationResult === true) {
						continue;
					}

					set(errors, path, { id: validationResult, type: "validation", message: formatValidationError({type: validationResult, params: {path, value: field.value}}, { messages }) });
				}
			}

			return {
				errors,
				values: omit(data, Object.keys(errors))
			}
		},
		[schema]
	)
}

export default useValidationResolver;