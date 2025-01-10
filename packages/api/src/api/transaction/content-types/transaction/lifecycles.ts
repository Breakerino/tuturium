//
import _ from 'lodash';
import moment from 'moment';

//
export default {
	// TODO: Handle update (beforeUpdate - compare and adjust wallet ballance accordingly)
	async beforeCreate(event) {
		const { data } = event.params;
		
		// Skip if does not linking to any wallet
		if ( ! _.has(data.wallet, 'connect[0].id') ) {
			return;
		}
		
		const wallet = await strapi.entityService.findOne('api::wallet.wallet', _.get(data.wallet, 'connect[0].id'));
		
		// Skip if linked wallet is a "bank" type (automatically synced via GoCardless API)
		if ( wallet.type === 'bank' )  {
			return;	
		}
		
		//
		if ( _.isEmpty(data.postingDate) )  {
			event.params.data.postingDate = moment().format('YYYY-MM-DD')
		}
		
		//
		if ( _.isEmpty(data.valueDate) )  {
			event.params.data.valueDate = moment().format('YYYY-MM-DD')
		}
		
		//
		event.params.data.status = 'booked'
		
		//
		event.params.data.currency = wallet.currency
	},
	async afterCreate(event) {
		const { result: {id} } = event;
				
		const data = await strapi.entityService.findOne('api::transaction.transaction', id, {
			populate: {
				receipt: true,
				labels: true,
				creditor: true,
				debtor: true,
				category: true,
				wallet: {
					populate: {
						balanceHistory: true,
						user: {
							populate: {
								wallets: true
							}
						}
					}
				}
			}
		});
		
		// Update transaction category with the matched one
		await strapi.entityService.update('api::transaction.transaction', id, {
			data: await strapi.service('api::transaction.transaction').categorizeTransaction(data)
		});
		
		// Skip if not linked to any wallet or has no amount
		if ( _.isEmpty(data.wallet) || ! _.isNumber(data.amount) ) {
			return;
		}
		
		const currentDate = new Date().toISOString();
		
		// Skip if linked wallet is a "bank" type (automatically synced via GoCardless API)
		if ( data.wallet.type === 'bank' ) {
			const savingsWalletIBAN = data.amount > 0 ? data.debtor.iban : data.creditor.iban;
			
			// Skip entirely if no target IBAN　
			if ( _.isEmpty(savingsWalletIBAN) ) {
				return;
			}
			
			// Check whether debtor or creditor IBAN belongs to one of the user's savings wallets
			const savingsWallet = await strapi.db.query('api::wallet.wallet').findOne({
				where: {
					iban: savingsWalletIBAN
				}
			})
			
			// Skip entirely if does not match any of user's savings wallets
			if ( ! savingsWallet ) {
				return;
			}
			
			const newSavingsWalletBalance = savingsWallet.balance + (data.amount * -1);
			
			// Update linked related savings wallet balance (inverted)
			await strapi.entityService.update('api::wallet.wallet', savingsWallet.id, {
				data: {
					balance: newSavingsWalletBalance,
					balanceHistory: [
						...(_.isArray(savingsWallet.balanceHistory) ? savingsWallet.balanceHistory : []),
						{ date: currentDate, balance: newSavingsWalletBalance }
					],
					lastUpdateAt: currentDate
				}
			})
			
			return;
		}
		
		const newWalletBalance = data.wallet.balance + data.amount;
		
		// Update linked wallet balance
		await strapi.entityService.update('api::wallet.wallet', data.wallet.id, {
			data: {
				balance: newWalletBalance,
				balanceHistory: [
					...(_.isArray(data.wallet.balanceHistory) ? data.wallet.balanceHistory : []),
					{ date: currentDate, balance: newWalletBalance }
				],
				lastUpdateAt: currentDate
			}
		})
	},
	async beforeDelete(event) {
		const { id } = event.params.where;
		
		const data = await strapi.entityService.findOne('api::transaction.transaction', id, {
			populate: {
				wallet: {
					populate: {
						balanceHistory: true,
					}
				},
				creditor: true,
				debtor: true,
			}
		});
		
		// Skip if not linked to any wallet or has no amount
		if ( _.isEmpty(data.wallet) || ! _.isNumber(data.amount) ) {
			return;
		}
		
		// Skip if linked wallet is a "bank" type (automatically synced via GoCardless API)
		if ( data.wallet.type === 'bank' ) {
			return;
		}
		
		const currentDate = new Date().toISOString();
		const newWalletBallance = data.wallet.balance + (data.amount * -1);
		
		// Update linked wallet balance (inverted)
		await strapi.entityService.update('api::wallet.wallet', data.wallet.id, {
			data: {
				balance: newWalletBallance,
				balanceHistory: [
					...(_.isArray(data.wallet.balanceHistory) ? data.wallet.balanceHistory : []),
					{ date: currentDate, balance: newWalletBallance }
				],
				lastUpdateAt: currentDate
			}
		})
	}
};