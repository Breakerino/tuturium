import { factories } from '@strapi/strapi';
import crypto from 'crypto';
import { Store } from '../types';
import { generateStoreDisplayName } from '../functions';

export default factories.createCoreService('api::store.store', ({ strapi }) => ({
	async generateStoreUID({ name, streetAddress, postalCode, organization: { companyID = '', companyTaxID = '' } }: Store) {
		return crypto.createHash('sha256').update(`${name}${streetAddress}${postalCode}${companyID}${companyTaxID}`, 'utf8').digest('hex');
	},
	async findOrCreate({ data }) {
		const uid = await this.generateStoreUID(data);

		const existingEntry = await strapi.db.query('api::store.store').findOne({
			select: ['id'],
			where: { uid }
		});

		// 1.3. Create store if not exists
		if (existingEntry?.id) {
			return existingEntry.id;
		}

		const createdEntry = await strapi.entityService.create('api::store.store', {
			data: {
				...data,
				uid,
				displayName: generateStoreDisplayName(data),
			}
		})

		return createdEntry?.id;
	}
}));
