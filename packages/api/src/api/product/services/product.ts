//
import _, { set } from 'lodash';
import { factories } from '@strapi/strapi';

//

export default factories.createCoreService('api::product.product', ({ strapi }) => ({
	async processProducts() {
		// 0. ---------
		const result = {
			count: 0
		};

		// 1. ---------

		const categories = await strapi.query('api::product.product-category').findMany({
			select: ['id', 'name'],
			populate: {
				parent: true
			}
		})

		let categoriesInput = {};

		for (const category of categories) {
			if (_.isNull(category.parent)) {
				categoriesInput[category.name] = {};
				continue;
			}
			
			set(categoriesInput, `${category.parent.name}.${category.id}`, category.name);
		}

		// 2. ---------

		const products = await strapi.query('api::product.product').findMany({
			select: ['id', 'name', 'unit', 'price'],
			where: {
				needsAiProcessing: true,
				aiProcessedAt: null
			}
		})

		result.count = products.length;

		if (_.isEmpty(products)) {
			return result;
		}

		// 3. ---------

		const productNameNormalizerInput = {
			//products: Object.fromEntries(products.map((product: Record<string, any>) => [product.id, `${product.name}|${product.unit}|${product.price}`])),
			products: Object.fromEntries(products.map((product: Record<string, any>) => [product.id, product.name])),
			sourceLocale: 'sk_SK',
			targetLocales: ['sk_SK', 'en_UK']
		};

		console.debug('productNameNormalizerInput', JSON.stringify(productNameNormalizerInput, null, 2));
		
		let localizedProducts = {};
		
		try {
			localizedProducts = await strapi.service('api::ai.assistent').processJSON('multi_product_name_normalizer', productNameNormalizerInput);
		} catch (e) {
			strapi.log.error(e);
			return result;
		}

		// 4. ---------

		const productsCategorizerInput = {
			c: categoriesInput,
			p: products.map(product => ({
				i: product.id,
				n: localizedProducts[product.id]['en_UK'],
				u: product.unit,
				p: product.p,
			}))
		}

		// TODO: Merge with existing product by localized name if possible (fuzzy match?)

		console.debug('productsCategorizerInput', JSON.stringify(productsCategorizerInput, null, 2));

		let categorizedProducts = {};
		
		try {
			categorizedProducts = await strapi.service('api::ai.assistent').processJSON('multi_product_categorizer', productsCategorizerInput);
		} catch (e) {
			strapi.log.error(e);
			return result;
		}

		console.log(JSON.stringify({ productLocalizations: localizedProducts, categorizedProducts }, null, 2));

		// 5. ---------

		for (const product of products) {
			await strapi.entityService.update('api::product.product', product.id, {
				data: {
					name: localizedProducts?.[product.id]?.sk_SK,
					originName: product.name,
					categories: categorizedProducts?.[product.id],
					aiProcessedAt: new Date().toISOString(),
					needsAiProcessing: false // ?
				}
			});
		}
		
		return result;
	}
}));
