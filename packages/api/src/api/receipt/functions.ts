//
import _, { isInteger, isNumber } from 'lodash';

// NOTE: Possible race condition - users A and B create a receipt with same item 
// 			 which does not exists yet can cause product to be created twice
// NOTE: Obselote, to remove
export const linkReceiptItemsToProducts = async ({items, issuedAt, taxes}) => {
	const itemsQueryArgs = {
		select: ['id', 'name', 'unit', 'price', 'vatRate', 'quantity'],
		where: {
			$and: [
				{
					id: {
						$in: items.map(({ id }) => id)
					}
				},
				{
					product: {
						$null: true
					}
				},
				{
					price: {
						$gte: 0
					}
				},
			]
		},
		populate: {
			product: true
		}
	};

	const itemEntries = await strapi.query('receipt.item').findMany(itemsQueryArgs);

	//console.log({ itemsQueryArgs: JSON.stringify(itemsQueryArgs, null, 2), itemEntries: JSON.stringify(itemEntries, null, 2) });

	for (const item of itemEntries) {
		// Skip if item has product assigned
		// if (item?.prduct?.id) {
		// 	continue;
		// }

		// Skip if item's price is empty or negative
		// if (_.isNil(item?.price) || item?.price < 0) {
		// 	continue;
		// }

		// Find existing receipt item by name with product linked
		let matchingProductID = (await strapi.query('receipt.item').findOne({
			select: ['id'],
			where: {
				$and: [
					{ product: { $notNull: true } },
					{ name: { $eq: item.name } },
				]
			},
			populate: {
				product: true
			}
		}))?.product.id ?? null;

		// Create new product if no matching product from similar item
		if (!matchingProductID) {
			console.log('PRODUCT', item);
			let productPrice = item.price;
			
			if ( isNumber(item.quantity) ) {
				productPrice = productPrice / item.quantity;
				
				// Convert to price per kilogram if quantity is a weight unit (g)
				if ( ! isInteger(item.quantity) ) {
					productPrice = productPrice * 1000;
				}
			}
			
			matchingProductID = (await strapi.entityService.create('api::product.product', {
				data: {
					..._.pick(item, ['name', 'unit', 'vatRate']),
					price: productPrice,
					needsAiProcessing: true,
					aiProcessedAt: null,
					priceHistory: [
						{
							date: issuedAt,
							price: productPrice,
							vatRate: taxes.find(tax => tax.name === item.vatRate).vatRate
						}
					]
				}
			})).id;
		} else {
			// TODO push to price history
		}

		// Link product to receipt item
		await strapi.query('receipt.item').update({
			where: { id: item.id },
			data: { product: matchingProductID }
		});
	}
}