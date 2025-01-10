//
import { factories } from '@strapi/strapi';
import _, { isEmpty } from 'lodash';

//
import Response from '../../../classes/Response';
import { GenericException, ResponseError } from '../../../utils/errors';
import { EKASA_RECEIPT_UID_REGEX } from '../constants';
import moment from 'moment';
import { sleep } from '../../../utils/functions';

// TODO: Entry locker (by uid - HTTP 409)

export default factories.createCoreController('api::receipt.receipt', ({ strapi }) => ({
	async find(ctx) {
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			let receipts = await strapi.db.query('api::receipt.receipt').findMany({
				select: ['uid', 'okp', 'total', 'currency', 'issuedAt'],
				where: { user: user.id },
				orderBy: {
					issuedAt: 'DESC'
				},
				populate: {
					items: {
						populate: {
							product: true
						}
					},
					taxes: true,
					store: true,
				}
			});

			receipts = receipts.map(receipt => {
				receipt.store = _.pick(receipt.store, ['uid', 'name', 'streetAddress', 'city', 'postalCode', 'country']);
				receipt.items = receipt.items.map((item) => {
					item.product = _.pick(item.product, ['name', 'unit', 'price', 'vatRate', 'currency']);
					return item;
				})
				return receipt;
			})

			response.setData(receipts);
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

			let receipt = await strapi.db.query('api::receipt.receipt').findOne({
				select: ['uid', 'okp', 'total', 'currency', 'issuedAt'],
				where: { user: user.id, okp: params.id },
				populate: {
					items: {
						populate: {
							product: {
								populate: {
									categories: {
										populate: {
											parent: true
										}
									}
								}
							}
						}
					},
					transaction: true,
					taxes: true,
					store: true,
				}
			});

			if (_.isEmpty(receipt)) {
				throw new ResponseError('Invalid receipt.', 400);
			}

			receipt.breakdown = {};
			
			receipt.transaction = receipt?.transaction?.id ?? null;

			for (const item of receipt.items) {
				if (!item?.product?.categories) {
					continue;
				}

				for (const category of item.product.categories) {
					if (!_.has(receipt.breakdown, category.id)) {
						_.set(receipt.breakdown, category.id, {
							name: category.name,
							total: 0,
						});
					}

					receipt.breakdown[category.id].total += item.price;
				}
			}

			receipt.store = _.pick(receipt.store, ['uid', 'name', 'streetAddress', 'city', 'postalCode', 'country']);
			receipt.items = await Promise.all(
				receipt.items.map(async (item) => {
					if (item.product?.categories?.[0]) {
						item.product.categories = [item.product.categories[0]?.parent?.name, item.product.categories[0].name].filter((name) => ! isEmpty(name));
					}

					item.product = _.pick(item.product, ['name', 'unit', 'price', 'vatRate', 'currency', 'categories']);
					return item;
				})
			);
			receipt.breakdown = Object.values(receipt.breakdown).sort((a: any, b: any) => a.total > b.total ? -1 : 1)

			response.setData(receipt);
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},

	async create(ctx) { // TODO: Rename to "scan"
		const { body: { uid } } = ctx.request;
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			if (!uid) {
				throw new ResponseError('Invalid data provided.', 400);
			}

			if (!uid.match(EKASA_RECEIPT_UID_REGEX)) {
				throw new ResponseError('Provided receipt UID is not valid.', 400);
			}

			const entryExists = await strapi.service('api::receipt.receipt').exists({ uid })

			if (entryExists) {
				throw new ResponseError('Receipt with same UID already exists.', 400);
			}

			let rawReceipt = null;

			// TODO: Request/response transformers to make this more abstracted
			// TODO: Error handling in service, transformable to throw custom exception
			try {
				const { data } = await strapi.service('api::receipt.ekasa-api').findReceipt({
					data: { receiptId: uid }
				});

				rawReceipt = _.isObject(data?.receipt) && !_.isEmpty(data?.receipt) ? data?.receipt : null;
			} catch (e) {
				// TODO: Handle too many requests (ratelimit - HTTP status 739?)
				throw new GenericException(`Unable to retrieve receipt data from eKasa API: ${e?.message}`);
			}

			if (_.isNil(rawReceipt)) {
				throw new GenericException(`Receipt is not available in eKasa database.`, 404);
			}

			const parsedReceipt = await strapi.service('api::receipt.receipt').parseEkasaReceipt(rawReceipt);

			const data = {
				...parsedReceipt,
				store: await strapi.service('api::store.store').findOrCreate({ data: parsedReceipt.store }),
				user: user.id,
				currency: 'EUR' // TEMP: eKasa API is Slovak only, so EUR by default
			};

			const createdEntry = await strapi.entityService.create('api::receipt.receipt', {
				data,
				populate: {
					store: true,
					items: {
						product: true
					}
				}
			});

			response.setData(createdEntry);
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},
	async import(ctx) {
		const { body: { receipts } } = ctx.request;
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			const createdReceipts = [];

			if (!receipts) {
				throw new ResponseError('Invalid data provided.', 400);
			}

			for (const uid of receipts) {
				if (!uid.match(EKASA_RECEIPT_UID_REGEX)) {
					throw new ResponseError('Provided receipt UID is not valid.', 400);
				}

				const entryExists = await strapi.service('api::receipt.receipt').exists({ uid })

				if (entryExists) {
					throw new ResponseError('Receipt with same UID already exists.', 400);
				}

				let rawReceipt = null;

				// TODO: Request/response transformers to make this more abstracted
				// TODO: Error handling in service, transformable to throw custom exception
				try {
					const { data } = await strapi.service('api::receipt.ekasa-api').findReceipt({
						data: { receiptId: uid }
					});

					rawReceipt = _.isObject(data?.receipt) && !_.isEmpty(data?.receipt) ? data?.receipt : null;
				} catch (e) {
					// TODO: Handle too many requests (ratelimit - HTTP status 739?)
					throw new GenericException(`Unable to retrieve receipt data from eKasa API: ${e?.message}`);
				}

				if (_.isNil(rawReceipt)) {
					throw new GenericException(`Receipt is not available in eKasa database.`, 404);
				}

				const parsedReceipt = await strapi.service('api::receipt.receipt').parseEkasaReceipt(rawReceipt);

				const data = {
					...parsedReceipt,
					store: await strapi.service('api::store.store').findOrCreate({ data: parsedReceipt.store }),
					user: user.id,
					currency: 'EUR' // TEMP: eKasa API is Slovak only, so EUR by default
				};

				const createdEntry = await strapi.entityService.create('api::receipt.receipt', {
					data,
					populate: {
						store: true,
						items: {
							product: true
						}
					}
				});

				// Push to created receipts array
				createdReceipts.push(createdEntry);

				// Wait 2500ms before creating another receipt to do not exceed eKasa API rate limit
				await sleep(2500);
			}

			response.setData(createdReceipts)
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	}
}));