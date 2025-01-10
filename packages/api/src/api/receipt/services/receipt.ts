//
import { factories } from '@strapi/strapi';
import _ from 'lodash';
import moment from 'moment';

//
import DataTransformer from '../../../modules/DataTransformer';
import { EKASA_RECEIPT_DATA_TRANSFORMER_CONFIG, EKASA_RECEIPT_UID_REGEX, PRODUCTS_PARSER_GPT_ASSISTENT_ID } from '../constants';
import { ekasaReceiptValidationSchema } from '../schemas';

export default factories.createCoreService('api::receipt.receipt', ({ strapi }) => ({
	async parseEkasaReceipt(rawData) {
		return await DataTransformer.transform(rawData, EKASA_RECEIPT_DATA_TRANSFORMER_CONFIG, ekasaReceiptValidationSchema);
	},
	async exists({ uid }) {
		return (await strapi.entityService.count('api::receipt.receipt', { filters: { uid } })) > 0;
	},
	async create(args) {
		// 1. Process "store"

		// 1.1 Generate store UID from data
		const storeUID = await strapi.service('api::store.store').generateStoreUID(args.data.store);

		// 1.2. Check if store exists by UID
		let storeID = (await strapi.db.query('api::store.store').findOne({
			select: ['id'],
			where: {
				uid: storeUID
			},
		}))?.id ?? null;

		// 1.3. Create store if not exists
		if (!storeID) {
			storeID = (await strapi.entityService.create('api::store.store', {
				data: {
					...args.data.store,
					displayName: `${args.data.store.name} - ${args.data.store.city} (${args.data.store.streetAddress})`,
					uid: storeUID
				}
			})).id;
		}

		// 1.4. Assign store id relation to receipt data object
		_.set(args.data, 'store', storeID)

		// 2. Process items

		//
		const result = await super.create(args);

		// 2. 

		return result;
	},
	async pair() {
		const result = {
			paired: [],
			unpaired: []
		}
		
		// Get all receipts without paired transactiopn
		const receipts = await strapi.entityService.findMany('api::receipt.receipt', {
			filters: {
				// @ts-ignore
				transaction: {
					// @ts-ignore
					$null: true,
				},
			},
			populate: {
				user: {
					populate: {
						wallets: true
					}
				}
			}
		})

		for (const receipt of receipts) {
			// Find matching transaction
			const transaction = await strapi.db.query('api::transaction.transaction').findOne({
				where: {
					wallet: {
						// @ts-ignore
						$in: receipt.user.wallets.map(wallet => wallet.id)
					},
					amount: Math.abs(receipt.total) * -1,
					receipt: {
						$null: true,
					},
					//valueDate: moment(receipt.issuedAt).format('YYYY-MM-DD'),
					//postingDate: { UPDATED @15/09/24
					valueDate: {
						$between: [
							moment(receipt.issuedAt).subtract(5, 'days').format('YYYY-MM-DD'),
							moment(receipt.issuedAt).add(5, 'days').format('YYYY-MM-DD'),
						]
					}
				}
			})

			if (!transaction) {
				result.unpaired.push(receipt.id);
				continue;
			}
			
			result.paired.push(receipt.id);

			await strapi.entityService.update('api::receipt.receipt', receipt.id, {
				data: {
					transaction: transaction.id
				}
			});
		}
		
		return result;
	},
}));
