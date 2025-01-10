//
import { factories } from '@strapi/strapi'
import _ from 'lodash';

// 
import Response from '../../../classes/Response';
import { ResponseError } from '../../../utils/errors';

export default (({ strapi }) => ({
	/**
	 * POST /actions/assign-merchant-categories
	 */
	async assignMerchantCategories(ctx) {
		const response = new Response(ctx);

		try {
			const result = await strapi.service('api::actions.actions').assignMerchantCategories();

			response.setData({
				message: `Result: ${result ? 'true' : 'false'}`,
				result
			});
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},
	/**
	 * POST /actions/extend-merchant-categories
	 */
	async extendMerchantCategories(ctx) {
		const response = new Response(ctx);

		try {
			// NOTE: Disabled
			//#const result = await strapi.service('api::actions.actions').extendMerchantCategories();
			const result = false;

			response.setData({
				message: `Result: ${result ? 'true' : 'false'}`,
				result
			});
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},
	/**
	 * POST /actions/auto-categorize-transactions
	 */
	async autoCategorizeTransactions(ctx) {
		const response = new Response(ctx);

		try {
			const result = await strapi.service('api::transaction.transaction').bulkCategorizeTransactions();

			response.setData({
				message: `Result: ${result ? 'true' : 'false'}`,
				result
			});
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},
}));