//
import { factories } from '@strapi/strapi'
import _ from 'lodash';
import moment from 'moment';

//
import Response from '../../../classes/Response';
import { ResponseError } from '../../../utils/errors';

export default factories.createCoreController('api::wallet.wallet', ({ strapi }) => ({
	async find(ctx) {
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			const wallets = await strapi.db.query('api::wallet.wallet').findMany({
				select: ['uid', 'name', 'type', 'balance', 'iban', 'currency'],
				where: { user: user.id }
			});

			response.setData(wallets);
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},

	async findOne(ctx) {
		const { user }: { user: Record<string, any> } = ctx.state;
		const { params }: { body: Record<string, any>, params: Record<string, string>, query: Record<string, string> } = ctx.request;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			if (_.isEmpty(params?.id)) {
				throw new ResponseError('No wallet UID provided.', 401);
			}

			const wallet = await strapi.db.query('api::wallet.wallet').findOne({
				select: ['uid', 'name', 'type', 'iban', 'balance', 'currency'],
				where: { user: user.id, uid: params.id },
			});

			if (wallet.type === 'savings') {
				const incomeCategory = await strapi.entityService.findOne('api::transaction.transaction-category', 26);
				const expenseCategory = await strapi.entityService.findOne('api::transaction.transaction-category', 28);
				
				wallet.transactions = await strapi.db.query('api::transaction.transaction').findMany({
					where: {
						$and: [
							{ wallet: { user: user.id } }
						],
						$or: [
							{ creditor: { iban: wallet.iban } },
							{ debtor: { iban: wallet.iban } },
						]
					},
					orderBy: {
						valueDate: 'DESC'
					},
					populate: {
						creditor: true,
						debtor: true,
						category: true,
						labels: true,
						receipt: true
					}
				})
				
				wallet.transactions = wallet.transactions.map((transaction) => ({
					...transaction,
					amount: transaction.amount * -1,
					category: transaction.category.id === 26 ? expenseCategory : incomeCategory
				}))
			} else {
				wallet.transactions = await strapi.db.query('api::transaction.transaction').findMany({
					where: {
						wallet: { user: user.id, uid: wallet.uid },
						category: {
							type: {
								$not: 'transfer'
							}
						},
					},
					orderBy: {
						valueDate: 'DESC',
						transactionID: 'DESC'
					},
					populate: {
						creditor: true,
						debtor: true,
						category: true,
						labels: true,
						receipt: true
					}
				})
			}

			response.setData(wallet);
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},

	/**
	 * POST /wallet/sync/:uid
	 * 
	 * @param ctx 
	 * @returns 
	 */
	async sync(ctx) {
		const { params }: { body: Record<string, any>, params: Record<string, string>, query: Record<string, string> } = ctx.request;
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			if (!_.has(params, 'uid') || _.isEmpty(params.uid)) {
				throw new ResponseError('Invalid "walletUID" provided.', 400);
			}

			const result = await strapi.service('api::wallet.wallet').syncWallet({walletUID: params.uid, userID: user.id})

			response.setData({
				message: `Successfuly synced wallet with bank account "${result.iban}" (${result.created} created, ${result.updated} updated)`
			});
		} catch (error) {
			response.setError(error);
		}

		return response.send();
	}
}));