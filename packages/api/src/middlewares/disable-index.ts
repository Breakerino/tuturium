// @ts-nocheck
export default (config, { strapi }) => {
	return async (ctx, next) => {
		if (ctx.request.url === '/') {
			ctx.redirect(config.redirectURI);
			return;
		}

		await next();
	};
};
