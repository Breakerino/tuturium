/**
 * wallet service
 */

import { factories } from '@strapi/strapi';
import { GenericException } from '../../../utils/errors';
import moment from 'moment';
import _ from 'lodash';

export default factories.createCoreService('api::wallet.wallet', ({ strapi }) => ({
	async syncWallet({walletUID, userID}) {
		const wallet = await strapi.db.query('api::wallet.wallet').findOne({
			select: ['id', 'uid', 'type', 'bankAccountID'],
			where: { uid: walletUID, user: userID },
			populate: ['balanceHistory']
		});

		if (!wallet) {
			throw new GenericException('Wallet does not exist.', 404);
		}

		if (wallet.type !== 'bank') {
			throw new GenericException('Wallet is not a bank type.', 400);
		}

		if (_.isEmpty(wallet.bankAccountID)) {
			throw new GenericException('Wallet is not connected to bank account yet.', 400);
		}

		const { iban, balance, currency } = await strapi.service('api::bank.bank').getAccountData(wallet.bankAccountID);

		const transactions = await strapi.service('api::bank.bank').getAccountTransactions({
			bankAccountID: wallet.bankAccountID,
			dateFrom: moment().startOf('month').format('YYYY-MM-DD'), // TODO: Be able to retrieve historical transactions from previous 3 months
			dateTo: moment().format('YYYY-MM-DD')
		});

		const result = { iban, balance, stats: {created: 0, updated: 0} }

		for (const transaction of transactions) {
			// Try to find existing transaction entry by externalID
			const existingTransaction = await strapi.db.query('api::transaction.transaction').findOne({
				where: { transactionID: transaction.transactionID }
			});

			// Update transaction if exists
			if (existingTransaction) {
				await strapi.entityService.update('api::transaction.transaction', existingTransaction.id, {
					data: _.omit(transaction, ['wallet', 'category', 'labels', 'categorizedVia', 'description', 'postingDate', 'valueDate'])
				});
				result.stats.updated++;
				continue;
			}

			// Create new transaction
			await strapi.entityService.create('api::transaction.transaction', { data: { ...transaction, wallet: wallet.id, type: 'bank' } });
			result.stats.created++;
		}

		const date = new Date().toISOString();
		
		// Store bank account ID into wallet
		await strapi.entityService.update('api::wallet.wallet', wallet.id, {
			data: {
				iban,
				balance,
				currency,
				balanceHistory: [
					...(_.isArray(wallet.balanceHistory) ? wallet.balanceHistory : []),
					{ date, balance }
				],
				lastUpdateAt: date
			}
		})

		return result;
	},
	async syncWallets() {
		// TODO: Logging
		const result = { count: 0 };
		
		const users = await strapi.db.query('plugin::users-permissions.user').findMany({
			select: ['id', 'uid'],
			populate: {
				wallets: true
			}
		});
		
		for ( const user of users ) {
			for ( const wallet of user.wallets ) {
				try {
					if ( wallet.type !== 'bank') {
						continue;
					}
					
					await this.syncWallet({walletUID: wallet.uid, userID: user.id});
					result.count++;
				} catch (e) {
					console.error(e);
				}
			}
		}
		return result;
	}
}));