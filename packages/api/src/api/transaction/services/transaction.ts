//
import { factories } from '@strapi/strapi';
import _, { isEmpty } from 'lodash';
import { evaulateCondition } from '../../../utils/functions';

export default factories.createCoreService('api::transaction.transaction', ({ strapi }) => ({
	async getTransactionCategoryByRules(rules, transaction) {
		if (_.isEmpty(rules)) {
			return null;
		}

		categorizationRules:
		for (const rule of rules) {
			// Skip if rule is non-applayable (due to missing data)
			if (_.isEmpty(rule.category) || _.isEmpty(rule.conditions)) {
				continue;
			}

			let passedCount = 0;

			ruleConditions:
			for (const condition of rule.conditions) {
				passedCount += Number(evaulateCondition(condition, transaction));
			}

			if ((rule.relation === 'OR' && passedCount > 0) || (rule.relation === 'AND') && passedCount === rule.conditions.length) {
				return rule.category;
			}
		}

		return null;
	},
	async getTransactionCategoryByMCC(transaction) {
		if (_.isEmpty(transaction.merchantCategoryCode)) {
			return null;
		}

		const matchingCategory = await strapi.db.query('api::transaction.transaction-category').findOne({
			select: ['id', 'name'],
			where: {
				merchantCategories: {
					code: transaction.merchantCategoryCode
				}
			}
		})

		return matchingCategory;
	},
	/**
	 * Retrieve transaction category
	 * 
	 * @param transaction 
	 * @returns object
	 */
	async categorizeTransaction(transaction) {
		if (!isEmpty(transaction?.category) && !isEmpty(transaction?.categorizedVia)) {
			return {
				category: transaction.category.id,
				categorizedVia: transaction.categorizedVia,
			};
		}

		const result = {
			category: null,
			categorizedVia: null
		};

		// 0. Try to match transfers between wallets
		if (!_.isEmpty(transaction.wallet.iban) && !_.isEmpty(transaction.creditor.iban) && !_.isEmpty(transaction.debtor.iban)) {
			const userWalletIBANs = transaction.wallet.user.wallets.map(wallet => wallet.iban);

			if (
				transaction.amount > 0
				&& transaction.wallet.iban === transaction.creditor.iban
				&& userWalletIBANs.includes(transaction.debtor.iban)
			) {
				result.category = 26; // Transfer (income)
				result.categorizedVia = 'transfer'
			}

			if (
				transaction.amount < 0
				&& transaction.wallet.iban === transaction.debtor.iban
				&& userWalletIBANs.includes(transaction.creditor.iban)
			) {
				result.category = 28; // Transfer (expense)
				result.categorizedVia = 'transfer'
			}
		}

		// 1. Try to match category by user rules
		if (!result.category && _.isNumber(transaction.wallet.user?.id)) {
			const { transactionCategorizationRules: userCategorizationRules } = await strapi.entityService.findOne('plugin::users-permissions.user', transaction.wallet.user?.id, {
				populate: {
					transactionCategorizationRules: {
						populate: ['category', 'conditions']
					}
				}
			});

			result.category = (await this.getTransactionCategoryByRules(userCategorizationRules, transaction))?.id;

			if (result.category) {
				result.categorizedVia = 'user-rule';
			}
		}

		// 2. Try to match category by global rules
		if (!result.category) {
			const { transactionCategorizationRules: globalCategorizationRules } = await strapi.entityService.findOne('api::global-setting.global-setting', 1, {
				populate: {
					transactionCategorizationRules: {
						populate: ['category', 'conditions']
					}
				}
			});

			result.category = (await this.getTransactionCategoryByRules(globalCategorizationRules, transaction))?.id;

			if (result.category) {
				result.categorizedVia = 'global-rule';
			}
		}

		// 3. Try to match category by transaction's MCC
		if (!result.category) {
			result.category = (await this.getTransactionCategoryByMCC(transaction))?.id;

			if (result.category) {
				result.categorizedVia = 'mcc';
			}
		}

		return result;
	},

	/**
	 * Auto categorize transactions
	 * 
	 * @returns boolean
	 */
	async bulkCategorizeTransactions() {
		const transactions = await strapi.entityService.findMany('api::transaction.transaction', {
			//limit: 10,
			filters: {
				//category: null,
				categorizedVia: {
					$null: true
				}
			},
			populate: {
				receipt: true,
				labels: true,
				creditor: true,
				debtor: true,
				wallet: {
					populate: {
						user: {
							populate: {
								wallets: true
							}
						}
					}
				}
			}
		});

		for (const transaction of transactions) {
			// Update transaction category with the matched one
			await strapi.entityService.update('api::transaction.transaction', transaction.id, {
				data: await this.categorizeTransaction(transaction)
			});
		}

		return transactions;
	}
}));
