export type ServiceConfig = never;

export enum AppService {}

export type AppServiceConfigs = Record<AppService, ServiceConfig>;

export default ({ env }): AppServiceConfigs => ({
	// service: {},
});

// Usage: strapi.config.get<AppServiceConfigs>('app').service;