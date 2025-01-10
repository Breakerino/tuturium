import _ from 'lodash';
import * as yup from 'yup';

// export type MappingConfig<T> = {
// 	[K in string]?: keyof T | MappingConfig<T>;
// };
export type MappingConfig<T> = any;

export default class DataTransformer<T extends Record<string, any>> {
	private mappingConfig: MappingConfig<T>;
	private validationSchema?: yup.AnySchema;

	constructor(mappingConfig: MappingConfig<T> = {}, validationSchema?: yup.AnySchema) {
		this.mappingConfig = mappingConfig;
		this.validationSchema = validationSchema;
	}

	private async validate(data: any): Promise<T> {
		if (!this.validationSchema) {
			return data as T; // No validation schema provided, return data as-is
		}

		try {
			const validatedData = await this.validationSchema.validate(data, {
				abortEarly: false,
				stripUnknown: true,
			});
			return validatedData as T;
		} catch (validationError) {
			throw new Error(`Validation failed: ${(validationError as any)?.errors?.join(', ')}`);
		}
	}

	private async map(data: any, customMappingConfig: MappingConfig<T> = {}): Promise<any> {
		const validatedData = await this.validate(data);
		const parsedData: any = {};

		const mapping = { ...this.mappingConfig, ...customMappingConfig } as MappingConfig<T>;

		for (const [target, source] of Object.entries(mapping)) {
			if (_.isObject(source)) {
				//
				let { _source, _mapping, _transform, _type } = source as any;

				if (!_source && !_type) {
					const _mapping = source as MappingConfig<T>;
					const _parsedData = await DataTransformer.transform(validatedData, _mapping);
					_.set(parsedData, target as string, _parsedData);
					continue;
				}

				if (!_source && _type === 'array') {
					_.set(parsedData, target as string, []);

					for (const [_index, _item] of (_mapping.entries() as any)) {
						const _parsedData = await DataTransformer.transform(validatedData, _item);
						parsedData[target as string].push(_.isFunction(_transform) ? _transform(_parsedData, validatedData) : _parsedData);
					}

					continue;
				}

				if (!_.has(validatedData, _source)) {
					continue;
				}

				const _data = _.get(validatedData, _source);

				if (!_mapping) {
					_.set(parsedData, target as string, _.isFunction(_transform) ? _transform(_data, validatedData) : _data);
					continue;
				}

				if (_.isArray(_data)) {
					const _parsedData = await Promise.all(_data.map((innerItem: any) => DataTransformer.transform(innerItem, _mapping)));
					_.set(parsedData, target as string, _.isFunction(_transform) ? _transform(_parsedData, validatedData) : _parsedData);
					continue;
				}

				if (_.isObject(_data)) {
					const _parsedData = await DataTransformer.transform(_data, _mapping);

					_.set(parsedData, target as string, _.isFunction(_transform) ? _transform(_parsedData, validatedData) : _parsedData);
					continue;
				}
			}
			_.set(parsedData, target as string, _.get(validatedData, source as string, source));
		}

		return parsedData;
	}

	public static async transform<U extends Record<string, any>>(
		data: any,
		mappingConfig: MappingConfig<U>,
		validationSchema?: yup.AnySchema
	): Promise<any> {
		const transformer = new DataTransformer(mappingConfig, validationSchema);
		const transformedData = await transformer.map(data);
		return transformedData;
	}
}
