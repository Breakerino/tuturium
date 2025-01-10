//
import _ from 'lodash';

// 
import { MERCHANT_CATEGORY_CODES_LIST } from '../constants';
import { Strapi } from '@strapi/strapi';

export default (({ strapi }: {strapi: Strapi}) => ({
	/**
	 * Assign merchant categories
	 * 
	 * @returns boolean
	 */
	async assignMerchantCategories() {
		// Retrieve expense transaction categories
		const transactionCategories = await strapi.entityService.findMany('api::transaction.transaction-category', {
			filters: {
				type: 'expense',
			},
			populate: ['merchantCategories']
		})

		console.log({ transactionCategories });

		// Skip if no transaction categories found
		if (_.isEmpty(transactionCategories)) {
			return false;
		}

		// Prepare AI input (exclude non-empty merchant categories and categories Loans (16) and Other (18))
		const aiInput = Object.fromEntries(
			transactionCategories
				.filter((category) => _.isEmpty(category.merchantCategories) && ![16, 18].includes(category.id as number))
				.map(({ id, name }) => ([id, name]))
		);
		
		console.log({ aiInput });

		// Skip if AI input is empty
		if (_.isEmpty(aiInput)) {
			return false;
		}
		
		// Retrieve AI output
		const aiOutput = await strapi.service('api::ai.assistent').processJSON('multi_transaction_category_to_mcc', aiInput);

		console.log({ aiOutput });

		for (const [id, categories] of Object.entries<any>(aiOutput)) {
			const merchantCategories: any = [];

			for (const categoryCode of categories) {
				const category = MERCHANT_CATEGORY_CODES_LIST.find(category => category.code == categoryCode);

				merchantCategories.push(category ?? {
					name: null,
					code: categoryCode
				})
			}

			console.log({ id, merchantCategories });

			await strapi.entityService.update('api::transaction.transaction-category', id, {
				data: {
					merchantCategories
				}
			})
		}

		return true;
	},

	/**
	 * Extend merchant categories
	 * 
	 * @returns boolean
	 */
	async extendMerchantCategories() {
		// Retrieve expense transaction categories
		const transactionCategories = await strapi.entityService.findMany('api::transaction.transaction-category', {
			filters: {
				type: 'expense',
			},
			populate: ['merchantCategories']
		})

		console.log({ transactionCategories });

		// Skip if no transaction categories found
		if (_.isEmpty(transactionCategories)) {
			return false;
		}

		for (const transactionCategory of transactionCategories) {
			// Skip if has not any merchant categories and also categories Loans (16) and Other (18)
			if (_.isEmpty(transactionCategory.merchantCategories) || [16, 18].includes(transactionCategory.id as number)) {
				continue;
			}

			// Prepare AI input
			const aiInput = { [transactionCategory.name]: transactionCategory.merchantCategories.map(merchantCategory => merchantCategory.code) }
			console.log(transactionCategory.name, { aiInput });

			// Retrieve AI output
			const aiOutput = await strapi.service('api::ai.assistent').processJSON('single_transaction_category_mcc_extend', aiInput);
			console.log(transactionCategory.name, { aiOutput });

			// Skip if AI output is empty
			if (_.isEmpty(aiOutput)) {
				continue;
			}

			const merchantCategories = transactionCategory.merchantCategories as any;

			for (const [code, name] of Object.entries(aiOutput)) {
				// Skip if already has a given category
				if (merchantCategories.findIndex(merchantCategory => merchantCategory.code === code) != -1) {
					continue;
				}

				const category = MERCHANT_CATEGORY_CODES_LIST.find(category => category.code == code);

				merchantCategories.push(category ?? { name, code })
			}

			console.log(transactionCategory.name, merchantCategories);

			await strapi.entityService.update('api::transaction.transaction-category', transactionCategory.id, {
				data: {
					merchantCategories
				}
			})
		}

		return true;
	}
}));