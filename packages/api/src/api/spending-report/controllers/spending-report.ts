//
import { factories } from '@strapi/strapi';
import _ from 'lodash';

//
import moment from 'moment';
import { ApiProductProduct } from '../../../../types/generated/contentTypes';
import Response from '../../../classes/Response';
import { ResponseError } from '../../../utils/errors';
import HTTPStatusCode from '../../../utils/http-status-codes';

export default factories.createCoreController('api::receipt.receipt', ({ strapi }) => ({
	/**
	 * GET /spending-report
	 * 
	 * @param ctx 
	 */
	async retrieve(ctx) {
		const { query }: { body: Record<string, any>, params: Record<string, string>, query: Record<string, string> } = ctx.request;
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			let dateFrom = _.has(query, 'from') ? moment(query.from) : null;
			let dateTo = _.has(query, 'from') ? moment(query.to) : null;

			const wallet = _.has(query, 'wallet')
				? await strapi.db.query('api::wallet.wallet').findOne({
					select: ['uid', 'name'],
					where: { uid: query.wallet, user: user.id }
				})
				: null;

			if (_.has(query, 'wallet') && !wallet) {
				throw new ResponseError('Invalid wallet', HTTPStatusCode.BAD_REQUEST);
			}
			
			let spendingReport = null;
			
			if ( ! dateFrom && ! dateTo ) {
				dateFrom = moment().startOf('month');
				dateTo = moment().endOf('month');
				
				for (let monthsBack = 0; monthsBack < 12; monthsBack++) {
					spendingReport = await strapi.service('api::spending-report.spending-report').getSpendingReport({
						user, 
						wallet,
						dateFrom, 
						dateTo
					});
					
					if ( ! _.isEmpty(spendingReport.transactions) ) {
						break;
					}
					
					dateFrom = dateFrom.subtract(1, 'month');
					dateTo = dateTo.subtract(1, 'month');
				}
			} else {
				spendingReport = await strapi.service('api::spending-report.spending-report').getSpendingReport({
					user, 
					wallet,
					dateFrom, 
					dateTo
				});
			}

			response.setData({
				date: { from: dateFrom, to: dateTo },
				...spendingReport
			})
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},
	async getTransactionCategory(ctx) {
		const { params, query }: { body: Record<string, any>, params: Record<string, string>, query: Record<string, string> } = ctx.request;
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			const dateFrom = _.has(query, 'from') ? moment(query.from) : moment().startOf('month');
			const dateTo = _.has(query, 'from') ? moment(query.to) : moment().endOf('month');

			const category = await strapi.db.query('api::transaction.transaction-category').findOne({
				select: ['name', 'type', 'uid'],
				where: {
					uid: params.uid,
					type: {
						$not: 'transfer'
					}
				}
			});

			if (!category) {
				throw new ResponseError('Invalid category', HTTPStatusCode.NOT_FOUND);
			}

			const wallet = _.has(query, 'wallet')
				? await strapi.db.query('api::wallet.wallet').findOne({
					select: ['uid', 'name'],
					where: { uid: query.wallet, user: user.id }
				})
				: null;

			if (_.has(query, 'wallet') && !wallet) {
				throw new ResponseError('Invalid wallet', HTTPStatusCode.BAD_REQUEST);
			}

			let transactions: Record<string, any>[] = await strapi.entityService.findMany('api::transaction.transaction', {
				filters: {
					category: {
						uid: params.uid,
						type: {
							$not: 'transfer'
						}
					},
					wallet: {
						user: user.id,
						...(wallet ? { uid: wallet.uid } : {})
					},
					valueDate: {
						$between: [
							dateFrom.format('YYYY-MM-DD'),
							dateTo.format('YYYY-MM-DD')
						]
					},
					$or: [
						{ excludedFromReporting: { $null: true } },
						{ excludedFromReporting: false },
					]
				},
				sort: { valueDate: 'desc', transactionID: 'desc' },
				populate: {
					creditor: true,
					debtor: true,
					category: true,
					labels: true,
					wallet: true
				}
			})

			transactions = transactions.map((transaction) => {
				transaction.creditor = _.pick(transaction.creditor, ['name', 'iban', 'currency', 'agent']);
				transaction.debtor = _.pick(transaction.debtor, ['name', 'iban', 'currency', 'agent']);
				transaction.category = _.pick(transaction.category, ['uid', 'name', 'type']);
				transaction.labels = transaction.labels.map((label) => {
					return _.pick(label, ['uid', 'name']);
				})
				transaction.wallet = transaction.wallet.uid;

				return transaction;
			})

			const total = transactions.reduce((total, transaction) => total + transaction.amount, 0);

			response.setData({ category, wallet, transactions, total })
		} catch (e) {
			response.setError(e);
		}

		return response.send();
	},
	async getProductCategory(ctx) {
		const { params, query }: { body: Record<string, any>, params: Record<string, string>, query: Record<string, string> } = ctx.request;
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			const dateFrom = _.has(query, 'from') ? moment(query.from) : moment().startOf('month');
			const dateTo = _.has(query, 'from') ? moment(query.to) : moment().endOf('month');

			const category = await strapi.db.query('api::product.product-category').findOne({
				select: ['name'],
				where: {
					id: params.uid,
				},
				populate: {
					parent: {
						select: ['name']
					},
					children: true
				}
			});

			if (!category) {
				throw new ResponseError('Invalid category', HTTPStatusCode.NOT_FOUND);
			}

			const wallet = _.has(query, 'wallet')
				? await strapi.db.query('api::wallet.wallet').findOne({
					select: ['uid', 'name'],
					where: { uid: query.wallet, user: user.id }
				})
				: null;

			if (_.has(query, 'wallet') && !wallet) {
				throw new ResponseError('Invalid wallet', HTTPStatusCode.BAD_REQUEST);
			}

			let receipts = await strapi.db.query('api::receipt.receipt').findMany({
				select: ['uid', 'okp', 'total', 'currency', 'issuedAt'],
				where: {
					user: user.id,
					issuedAt: {
						$between: [
							dateFrom.format('YYYY-MM-DD'),
							dateTo.format('YYYY-MM-DD')
						]
					},
					items: {
						product: {
							categories: {
								$in: [category.id, ...category.children.map(child => child.id)]
							}
						}
					}
				},
				orderBy: {
					issuedAt: 'DESC'
				},
				populate: {
					transaction: {
						select: [],
						populate: {
							wallet: {
								select: ['uid']
							}
						}
					},
					items: {
						select: ['id', 'price', 'quantity'],
						populate: {
							product: {
								select: ['id', 'name', 'unit', 'price'],
								populate: {
									categories: {
										select: ['id']
									}
								}
							}
						}
					},
					store: {
						select: ['name', 'displayName']
					},
				}
			});

			if (wallet) {
				receipts = receipts.filter(receipt => {
					if (!receipt.transaction) {
						return false;
					}

					return receipt.transaction.wallet.uid === wallet.uid;
				})
			}

			let products: Record<number, Partial<ApiProductProduct['attributes']> & { quantity: number, total: number }> = {};
			let total = {
				price: 0,
				quantity: 0
			};

			for (const receipt of receipts) {
				for (const item of receipt.items) {
					const hasCategory = item.product?.categories.find(itemCategory => [category.id, ...category.children.map(child => child.id)].includes(itemCategory.id))

					if (!hasCategory) {
						continue;
					}

					total.price += item.price;
					total.quantity += item.quantity;

					if (_.has(products, item.product.id)) {
						products[item.product.id].quantity += item.quantity;
						products[item.product.id].total += item.price;
						continue;
					}

					products[item.product.id] = ({
						...item.product,
						quantity: item.quantity,
						total: item.price,
					})
				}
			}

			receipts = receipts.map((receipt) => _.omit(receipt, ['items', 'transaction']));
			products = Object.values(products).map((product) => _.omit(product, ['categories'])).sort((a, b) => a.total > b.total ? -1 : 1);

			response.setData({
				receipts, products, total, wallet,
				category: _.pick(category, ['id', 'name', 'parent']),
			})
		} catch (e) {
			response.setError(e);
			throw e;
		}

		return response.send();
	}
}));