export default {
	tuturium: {
		type: 'admin',
		routes: [
			{
				method: 'POST',
				path: '/debug/wipe',
				handler: 'debug.wipeData',
				config: {
					policies: []
				},
			},
		]
	}
};
