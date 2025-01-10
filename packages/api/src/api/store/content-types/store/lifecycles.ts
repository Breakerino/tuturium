import _ from 'lodash';
import { generateStoreDisplayName } from '../../functions';

export default {
  async beforeCreate(event) {
		if ( _.isEmpty(event.params.data.uid) ) {
			event.params.data.uid = await strapi.service('api::store.store').generateStoreUID(event.params.data);
		}
		
		if ( _.isEmpty(event.params.data.displayName) ) {
	    event.params.data.displayName = generateStoreDisplayName(event.params.data)
		}
  },
  async beforeUpdate(event) {
		// Re-generate store uid
    event.params.data.uid = await strapi.service('api::store.store').generateStoreUID(event.params.data);
    event.params.data.displayName = generateStoreDisplayName(event.params.data)
  }
};