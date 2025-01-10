export default (policyContext, config, { strapi }) =>
	policyContext.state.isAuthenticated &&
	policyContext?.state?.auth?.strategy?.name === 'api-token' && (
		Array.isArray(config?.name) ?
			config.name.includes(policyContext?.state?.auth?.credentials?.name)
			:
			policyContext?.state?.auth?.credentials?.name === config?.name
	);
