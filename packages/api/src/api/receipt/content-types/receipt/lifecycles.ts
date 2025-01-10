//
import _ from 'lodash';

//

export default {
	async beforeCreate(event) {
		const { data: receipt, where, select, populate } = event.params;

		console.log({receipt});
		
		//throw new Error('DEBUG');
		
		// Retrieve suitable receipt items without product and positive price value
		const items = await strapi.query('receipt.item').findMany({
			select: ['id', 'name', 'unit', 'price', 'vatRate', 'quantity'],
			where: {
				$and: [
					{ id: { $in: receipt.items.map(({ id }) => id) } },
					{ product: { $null: true } },
					{ price: { $gte: 0 } },
				]
			},
			populate: {
				product: true
			}
		});

		for (const item of items) {
			const price = _.isNumber(item.quantity) ? Number((item.price / item.quantity).toFixed(2)) : item.price;

			// Try to find matching product by origin name or alternative names
			let matchingProduct = await strapi.db.query('api::product.product').findOne({
				where: {
					$or: [
						{ originName: item.name },
						{ alternativeNames: { name: item.name } }
					]
				},
				populate: ['priceHistory']
			});

			console.log({ matchingProduct1: matchingProduct });

			// Try to find matching product by exact item name
			if (!matchingProduct) {
				matchingProduct = (await strapi.db.query('receipt.item').findOne({
					select: ['id'],
					where: {
						$and: [
							{ product: { $notNull: true } },
							{ name: { $eq: item.name } },
						]
					},
					populate: {
						product: {
							populate: { priceHistory: true }
						}
					}
				}))?.product ?? null;
			}
			
			if (matchingProduct) {
				let priceHistory = matchingProduct?.priceHistory;
				
				// Push new price history entry if does not exists
				if ( priceHistory.findIndex(item => item.date === receipt.issuedAt && item.price === price) === -1 ) {
					priceHistory.push({
						price,
						date: receipt.issuedAt,
						vatRate: item.vatRate,
						store: receipt.store
					})
				}
				
				// Update matching product price and price history
				await strapi.entityService.update('api::product.product', matchingProduct.id, {
					data: {
						price,
						priceHistory
					}
				})
			} else {
				// Create new product from receipt item
				matchingProduct = await strapi.entityService.create('api::product.product', {
					data: {
						..._.pick(item, ['name', 'unit', 'vatRate']),
						price,
						currency: receipt.currency,
						originStore: receipt.store,
						needsAiProcessing: true,
						aiProcessedAt: null,
						priceHistory: [
							{
								price,
								date: receipt.issuedAt,
								vatRate: item.vatRate,
								store: receipt.store
							}
						]
					}
				})
			}

			// Link product to receipt item
			await strapi.query('receipt.item').update({
				where: { id: item.id },
				data: { product: matchingProduct.id }
			});
		}
	}
};