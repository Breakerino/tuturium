//
import { factories } from '@strapi/strapi';
import _, { has } from 'lodash';

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

			const dateFrom = _.has(query, 'from') ? moment(query.from) : moment().startOf('month');
			const dateTo = _.has(query, 'from') ? moment(query.to) : moment().endOf('month');

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
					...(
						(! wallet || wallet.type !== 'savings') ? {
							category: {
								type: {
									$not: 'transfer'
								}
							},
						} : {}
					),
					wallet: {
						user: user.id,
						...(wallet ? { uid: wallet.uid } : {})
					},
					// TODO: When has receipt, use issuedAt, otherwise postingDate (post-process?)
					valueDate: { // UPDATED @15/09/24
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
					category: true,
					receipt: { populate: { items: { populate: { product: { populate: { categories: true } } } } } },
					creditor: true,
					debtor: true,
					labels: true,
					wallet: true
				}
			})
			
			let totals = { income: 0, expense: 0 }
			let categories = { income: {}, expense: {}, products: {} };

			for (const transaction of transactions) {
				// Skip if transaction has no category (TEMP?)
				if (!_.isNumber(transaction?.category?.id)) {
					continue;
				}

				const transactionType = transaction.amount > 0 ? 'income' : 'expense';
				
				// Add transaction amount to totals
				totals[transactionType] += Math.abs(transaction.amount);
				totals[transactionType] = Number(totals[transactionType].toFixed(2))

				// Include category to the categories object if not exists
				if (!_.has(categories, `${transactionType}.${transaction.category.id}`)) {
					_.set(categories, `${transactionType}.${transaction.category.id}`, {
						uid: transaction.category.uid,
						name: transaction.category.name,
						total: 0,
						transactions: 0,
						breakdown: {}
					});
				}

				// Add transaction amount to category total
				categories[transactionType][transaction.category.id].total += transaction.amount;
				categories[transactionType][transaction.category.id].total = Number(categories[transactionType][transaction.category.id].total.toFixed(2))

				categories[transactionType][transaction.category.id].transactions += 1;

				// Skip if transaction has not receipt
				if (_.isEmpty(transaction?.receipt)) {
					continue;
				}

				for (const receiptItem of transaction.receipt.items) {
					// Skip if receipt item has no product
					if (!_.has(receiptItem, 'product.categories[0].id')) {
						continue;
					}

					// Include product category to the transaction breakdown object if not exists
					if (!_.has(categories, `${transactionType}.${transaction.category.id}.breakdown.${receiptItem.product.categories[0].id}`)) {
						_.set(categories, `${transactionType}.${transaction.category.id}.breakdown.${receiptItem.product.categories[0].id}`, {
							id: receiptItem.product.categories[0].id,
							name: receiptItem.product.categories[0].name,
							total: 0,
						});
					}

					//
					if (!_.has(categories, `products.${receiptItem.product.categories[0].id}`)) {
						_.set(categories, `products.${receiptItem.product.categories[0].id}`, {
							id: receiptItem.product.categories[0].id,
							name: receiptItem.product.categories[0].name,
							total: 0,
							receipts: 0
						});
					}

					// Add receipt item total price to transaction breakdown total
					categories[transactionType][transaction.category.id].breakdown[receiptItem.product.categories[0].id].total += receiptItem.price;
					categories[transactionType][transaction.category.id].breakdown[receiptItem.product.categories[0].id].total = Number(categories[transactionType][transaction.category.id].breakdown[receiptItem.product.categories[0].id].total.toFixed(2))

					//
					categories.products[receiptItem.product.categories[0].id].total += receiptItem.price;
					categories.products[receiptItem.product.categories[0].id].total = Number(categories.products[receiptItem.product.categories[0].id].total.toFixed(2));
					categories.products[receiptItem.product.categories[0].id].receipts += 1;
				}

				// TODO: Product categories breakdown

				//
				//categories[transactionType][transaction.category.id].transactions.push(transaction.id);
			}

			//
			categories.income = Object.values(categories.income).sort((a: any, b: any) => a.total > b.total ? -1 : 1)
			categories.expense = Object.values(categories.expense).sort((a: any, b: any) => a.total > b.total ? 1 : -1)
			categories.products = Object.values(categories.products).sort((a: any, b: any) => a.total > b.total ? -1 : 1)

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

			response.setData({
				date: { from: dateFrom, to: dateTo },
				totals,
				categories,
				transactions
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

					if (has(products, item.product.id)) {
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