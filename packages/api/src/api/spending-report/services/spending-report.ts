import _ from 'lodash';

export default () => ({
	async getSpendingReport({user, wallet, dateFrom, dateTo}) {
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
		
		return {totals, categories, transactions}
	}
});
