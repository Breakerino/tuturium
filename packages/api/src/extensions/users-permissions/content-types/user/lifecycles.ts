//
import _ from 'lodash';

//
export default {
	async beforeUpdate(event) {
		const { id } = event.params.where;
		const user = await strapi.entityService.findOne('plugin::users-permissions.user', id);
	}
};