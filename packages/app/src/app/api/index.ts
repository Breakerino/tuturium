//
import Axios, { AxiosError, AxiosRequestConfig, AxiosRequestTransformer, AxiosResponse, AxiosResponseTransformer } from 'axios';
import { isArray, isEmpty, isObject, isUndefined, keys, merge } from 'lodash';
import React from 'react';

//
import useLogger from '@/hooks/useLogger';

//
import config from './config';
import endpoints from './endpoints';
import { useUserContext } from '@/contexts/UserContext';

// TODO: Abstract into module (ApiContext)

declare global {
	// TODO: Infer types from passed object (is possible)
	interface ObjectConstructor {
		entries<K, V>(o: any): ([K, V])[]
	}
}

export interface EndpointsArgs extends RequestArgs {
	url: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE',
	transform?: {
		request?: AxiosRequestTransformer,
		response?: AxiosResponseTransformer,
	}
}

export interface RequestArgs {
	urlParams?: Record<string, string | number>,
	params?: Record<string, string | number>,
	data?: Record<string, unknown>,
	headers?: Record<string, string>,
	access?: 'public' | 'private' | 'global'
	transform?: {
		request?: AxiosRequestTransformer,
		response?: AxiosResponseTransformer,
	}
}

export interface UseApiProps { }

const axios = Axios.create({ ...config });

export const useApi = () => {
	const logger = useLogger('Api');
	const user = useUserContext();
	
	// TODO: move outside of component ?
	const handleRequest = (id: (keyof typeof endpoints), _defaultArgs: EndpointsArgs) => {
		return (
			async (_passedArgs: RequestArgs): Promise<AxiosResponse> => { // TODO
				//
				// Prepare endpoint args
				//

				let { transform: defaultTransform, url, method, access: defaultAccess, params: defaultParams, urlParams: defaultUrlPrams, data: defaultData, ...defaultArgs } = merge({}, _defaultArgs);
				let { transform: passedTransform, urlParams: passedUrlParams, access: passedAccess, ...passedArgs } = merge({}, _passedArgs);

				// TODO: Filter nullish data/params/urlParams from defaultArgs

				let requestArgs: AxiosRequestConfig & {
					transformRequest: AxiosRequestTransformer[]
					transformResponse: AxiosResponseTransformer[]
				} = {
					...defaultArgs, ...passedArgs,
					url, method,
					headers: { ...defaultArgs?.headers, ...passedArgs?.headers },
					transformRequest: [],
					transformResponse: []
				};

				// Replace URL params placeholders (:param)
				if (passedUrlParams) {
					for (const [key, value] of Object.entries<string | number>(passedUrlParams)) {
						requestArgs.url = requestArgs.url?.replaceAll(`:${key}`, String(value));
					}
				}

				// Include authorization header
				const access = passedAccess ?? defaultAccess ?? 'global';
						
				if (['global', 'private'].includes(access) && !isEmpty(user.store.authToken)) {
					// @ts-ignore
					requestArgs.headers['Authorization'] = `Bearer ${user.store.authToken}`;
				}
				
				// TODO: Validate required args

				//
				// Request transform
				//

				requestArgs.transformRequest = [
					...(defaultTransform?.request ? [defaultTransform?.request] : []),
					...(passedTransform?.request ? [passedTransform?.request] : []),
					...(! isUndefined(axios?.defaults?.transformRequest) ? (isArray(axios.defaults.transformRequest) ? [...axios.defaults.transformRequest] : [axios.defaults.transformRequest]) : []),
				]

				//
				// Response transform
				//

				requestArgs.transformResponse = [
					...(! isUndefined(axios?.defaults?.transformResponse) ? (isArray(axios.defaults.transformResponse) ? [...axios.defaults.transformResponse] : [axios.defaults.transformResponse]) : []),
					...(defaultTransform?.response ? [defaultTransform?.response] : []),
					...(passedTransform?.response ? [passedTransform?.response] : []),
				]

				//
				// Response
				//

				let response = null

				try {
					logger.debug(`REQUEST: ${method} ${url} (${id})`, { request: requestArgs });
					response = await axios({ ...requestArgs });
					logger.debug(`RESPONSE: ${method} ${url} (${id})`, response);

					logger.table(response.data, isArray(response.data) && isObject(response.data[0]) ? keys(response.data[0]) : (isObject(response.data) ? keys(response.data) : undefined));
				} catch (error) {
					logger.debug(`ERROR: ${method} ${url} (${id})`, error);
					
					if ( error instanceof AxiosError ) {
						if (error.response?.status === 401) {
							user.actions.logout();
						}
					}
					
					throw error;
				}

				return response;
			}
		)
	};

	
	const handlers = React.useMemo(() => {
		return Object.fromEntries(
			Object.entries<keyof typeof endpoints, EndpointsArgs>(endpoints).map(([id, args]) => [id, handleRequest(id, args)])
		) as Record<keyof typeof endpoints, (requestArgs?: RequestArgs) => Promise<AxiosResponse>>
	}, []);

	return handlers;
}