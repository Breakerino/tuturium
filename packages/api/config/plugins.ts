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
	}
});
