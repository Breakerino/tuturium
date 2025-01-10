import _ from 'lodash';
import Response from '../../../classes/Response';
import { ResponseError } from '../../../utils/errors';

export default ({ strapi }) => ({
	async update(ctx) {
		const { body: data }: { body: Record<string, any>, params: Record<string, string>, query: Record<string, string> } = ctx.request;
		const { user }: { user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			const sanitizedData = _.pickBy(data, (value, key) => 
				['username', 'password', 'encryptionKey', 'encryptionSalt', 'encryptedData'].includes(key) && value !== null && value !== undefined
			);
			
			const updatedData = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
				data: sanitizedData
			});

			response.setData({
				updated: true,
				encryptedData: updatedData.encryptedData
			});
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	}
})