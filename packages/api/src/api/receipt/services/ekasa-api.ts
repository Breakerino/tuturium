import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

type AxiosRequestConfig = InternalAxiosRequestConfig & { variables?: Record<string, string> };

export interface ApiRoute {
	path: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	params: Record<string, string|number>
}

const apiConfig = strapi.config.get('ekasa-api') as any; // !! crons ?

const Axios = axios.create({ baseURL: apiConfig.baseURL, timeout: apiConfig.timeout });

Axios.interceptors.request.use((config: AxiosRequestConfig) => {
	if (!config.url || !config?.variables) {
		return config;
	}

	const url = new URL(config.url, config.baseURL);

	Object.entries(config.variables!).forEach(([key, value]) => {
		url.pathname = url.pathname.replace(`:${key}`, encodeURIComponent(value as string));
	});

	return { ...config, url: url.pathname };
});

const generateService = (route: ApiRoute) => (
	async ({ data = {}, params = {}, variables = {} } = {}) =>
		Axios.request({
			url: route.path,
			variables,
			params,
			data,
			method: route.method,
		} as AxiosRequestConfig)
);

const generateServices = (routes: Record<string, ApiRoute>) => {
	const generatedServices: [string, Function][] = [];

	for (const [name, route] of Object.entries(routes)) {
		generatedServices.push([name, generateService(route)]);
	}

	return Object.fromEntries(generatedServices) as Record<
		string,
		({
			params,
			variables,
			data,
		}: Pick<AxiosRequestConfig, 'variables' | 'params' | 'data'>) => Promise<AxiosResponse>
	>;
};

const services = generateServices(apiConfig.routes);

export default services;