export default ({env}) => ([
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
	{
    name: 'strapi::poweredBy',
    config: {
      poweredBy: 'Tuturium',
    },
  },
  'strapi::query',
	{
    name: "strapi::body",
    config: {
			includeUnparsed: true,
      jsonLimit: "5mb"
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
	{
		name: 'global::disable-index',
		config: {
			redirectURI: `/v${env('API_VERSION', 1)}`
		}
	}
]);