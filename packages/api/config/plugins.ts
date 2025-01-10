import _ from 'lodash';
import { isEmpty } from 'lodash';

export default ({ env }) => ({
	'users-permissions': {
		config: {
			jwt: {
				expiresIn: '7d',
			},
		},
	},
	redis: {
		config: {
			connections: {
				default: {
					connection: {
						host: env('REDIS_HOST', ''),
						port: env.int('REDIS_PORT', 6379),
						password: env('REDIS_PASSWORD', ''),
					},
				},
			},
		},
	},
	'rest-cache': {
		config: {
			provider: { name: 'redis' },
			strategy: {
				contentTypes: [
					//{ contentType: 'api::', hitpass: false },
				],
				debug: true,
			},
		},
	},
	'import-export-entries': {
    enabled: true,
  },
	transformer: {
		enabled: true,
		config: {
			responseTransforms: {
				removeAttributesKey: true,
				removeDataKey: true,
			},
		},
	},
	meilisearch: {
		config: {
			// General
			host: `${env('MEILISEARCH_HOST', 'localhost')}:${env('MEILISEARCH_PORT', '7700')}`,
			apiKey: env('MEILISEARCH_API_KEY', ''),
			
			// Collection types
			product: {
				// filterEntry: ({ entry }) => {
				// 	return entry.enabled === true;
				// },
				// entriesQuery: {
				// 	limit: 1000,
				// },
			// import Meilisearch, { Index } from 'meilisearch';

			// const meilisearchConfig = strapi.config.get('plugin.meilisearch');

			// const meilisearch = new Meilisearch({
			// 	host: `http://${meilisearchConfig?.host}`,
			// 	apiKey: meilisearchConfig?.apiKey,
			// });

			// const productsIndex = meilisearch.index('product');

			// const response = await productsIndex.search(searchQuery, {
			// 	limit: 20,
			// });

			// productsIndex.searchSimilarDocuments({ id: 'TARGET_DOCUMENT_ID'})
				settings: {
					searchableAttributes: ['name', 'originName'],
				},
				transformEntry: ({ entry }) => _.pick(entry, ['id', 'name', 'originName'])
			},
		},
	}
});
