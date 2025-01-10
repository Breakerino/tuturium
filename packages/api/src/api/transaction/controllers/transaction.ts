//
import { factories } from '@strapi/strapi'
import _ from 'lodash';
import moment from 'moment';

//
import Response from '../../../classes/Response';
import { ResponseError } from '../../../utils/errors';
import { validateRequestData } from '../../../utils/functions';

export default factories.createCoreController('api::transaction.transaction', ({ strapi }) => ({
	// NOTE: Unused?
	async find(ctx) {
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			let transactions = await strapi.db.query('api::transaction.transaction').findMany({
				select: ['id', 'externalID', 'transactionID', 'valueDate', 'postingDate', 'status', 'amount', 'currency', 'description', 'additionalInformation', 'variableSymbol', 'specificSymbol', 'constantSymbol'],
				where: { wallet: { user: user.id } },
				orderBy: {
					valueDate: 'DESC'
				},
				populate: {
					creditor: true,
					debtor: true,
					category: true,
					labels: true,
					wallet: true
				}
			});

			transactions = transactions.map((transaction) => {
				transaction.creditor = _.pick(transaction.creditor, ['name', 'iban', 'currency', 'agent']);
				transaction.debtor = _.pick(transaction.debtor, ['name', 'iban', 'currency', 'agent']);
				transaction.category = _.pick(transaction.category, ['uid', 'name', 'type']);
				transaction.labels = transaction.labels.map((label) => {
					return _.pick(label, ['uid', 'name']);
				})
				transaction.wallet = _.pick(transaction.wallet, ['uid', 'name']);

				return transaction;
			})

			response.setData(transactions);
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
			
			if (_.isEmpty(params.id) || _.isNaN(params.id)) {
				throw new ResponseError('Invalid transaction.', 400);
			}

			let transaction = await strapi.db.query('api::transaction.transaction').findOne({
				where: { id: Number(params.id), wallet: {user: user.id} },
				populate: {
					category: true,
					receipt: true,
					creditor: true,
					debtor: true,
					labels: true,
					wallet: true,
				}
			});

			if (_.isEmpty(transaction)) {
				throw new ResponseError('Invalid transaction.', 400);
			}
			
			transaction.wallet = _.pick(transaction.wallet, ['uid', 'name']);
			transaction.receipt = transaction?.receipt?.okp ?? null;

			response.setData(transaction);
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},

	async create(ctx) {
		const { body: data } = ctx.request;
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			await validateRequestData(data, {
				wallet: 'string',
				date: 'string',
				amount: 'number',
				//description: 'string',
				//category: 'string',
			});

			const wallet = await strapi.db.query('api::wallet.wallet').findOne({
				where: {
					uid: data.wallet
				}
			});

			if (!wallet) {
				throw new Error('Invalid wallet provided.')
			}

			if (['bank', 'savings'].includes(wallet.type)) {
				throw new Error('Unsupported wallet type.')
			}

			const category = data?.category ? await strapi.db.query('api::transaction.transaction-category').findOne({
				where: {
					uid: data?.category
				}
			}) : null;

			const createdEntry = await strapi.entityService.create('api::transaction.transaction', {
				data: {
					wallet: wallet.id,
					postingDate: data.date,
					valueDate: data.date,
					amount: data.amount,
					currency: wallet.currency,
					description: data?.description,
					category: category?.id,
					status: 'booked',
					categorizedVia: category?.id ? 'manual' : null
				}
			});

			response.setData(createdEntry);
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	}
}));
