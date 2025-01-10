export default {
	routes: [
		{
			method: 'POST',
			path: '/wallets/sync/:uid',
			handler: 'wallet.sync',
			config: {
				policies: [], // TODO: Authorized user policy
				middlewares: [],
			},
		}
	]
}