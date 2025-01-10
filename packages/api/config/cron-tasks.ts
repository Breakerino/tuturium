import _ from 'lodash';

export default {
	pairReceiptsToTransactions: {
		task: async ({ strapi }) => {
			strapi.log.info(`Pair receipts to transactions | Initializing...`);
			const result = await strapi.service('api::receipt.receipt').pair();
			strapi.log.info(`Pair receipts to transactions | Processed ${result.unpaired.length + result.paired.length} receipts (paired: ${result.paired.length}, unpaired: ${result.unpaired.length})`);
		},
		options: {
			rule: '*/30 * * * * *', // Every 30 seconds
			tz: 'Europe/Prague',
		},
	},
	processProducts: {
		task: async ({ strapi }) => {
			strapi.log.info('Products Processing | Initializing...');
			const result = await strapi.service('api::product.product').processProducts();
			strapi.log.info(`Products Processing | Processed ${result.count} products.`);
		},
		options: {
			rule: '*/45 * * * * *', // Every 45 seconds
			tz: 'Europe/Prague',
		},
	},
	syncUsersWallets: {
		task: async ({ strapi }) => {
			strapi.log.info('Users Wallets Sync | Initializing...');
			const result = await strapi.service('api::wallet.wallet').syncWallets();
			strapi.log.info(`Users Wallets Sync | Processed ${result.count} users.`);
		},
		options: {
			rule: '0 0 */12 * * *', // Every 12 hours
			tz: 'Europe/Prague',
		},
	},
};
