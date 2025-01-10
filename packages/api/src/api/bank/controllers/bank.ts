//
import _ from 'lodash';

//
import Response from '../../../classes/Response';
import { ResponseError } from '../../../utils/errors';
import { GOCARDLESS_USER_REFERENCE_REGEX } from '../constants';

export default ({ strapi }) => ({
	/**
	 * POST /bank/connect
	 * 
	 * @param ctx 
	 * @returns 
	 */
	async connectInit(ctx) {
		const { body: data }: { body: Record<string, any>, params: Record<string, string>, query: Record<string, string> } = ctx.request;
		const { user }: {user: Record<string, any> } = ctx.state;

		const response = new Response(ctx);

		try {
			if (!_.isObject(user) || _.isEmpty(user?.uid)) {
				throw new ResponseError('User is not authorized.', 401);
			}

			if (! _.has(data, 'walletUID') || _.isEmpty(data.walletUID)) {
				throw new ResponseError('Invalid "walletUID" provided.', 400);
			}

			const wallet = await strapi.db.query('api::wallet.wallet').findOne({
				select: ['id', 'uid', 'bankInstitutionID'],
				where: { uid: data.walletUID, user: user.id }
			});

			if (!wallet) {
				throw new ResponseError('Wallet does not exist.', 404);
			}

			// Initialize bank connection session via GoCardless
			const session = await strapi.service('api::bank.bank').initSession({
				bankInstitutionID: user.bankInstitutionID,
				bankReferenceID: Buffer.from(`${user.uid}|${wallet.uid}`).toString('base64')
			});
			
			// Store requisition and agreement IDs from created session
			await strapi.entityService.update('api::wallet.wallet', wallet.id, {
				data: {
					bankRequisitionID: session.id,
					bankAgreementID: session.agreement,
					lastUpdateAt: new Date().toISOString()
				}
			})

			response.setData({
				...session
			});
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},

	/**
	 * POST /bank/connect/confirm
	 * 
	 * @param ctx 
	 * @returns 
	 */
	async connectConfirm(ctx) {
		const { query }: { body: Record<string, any>, params: Record<string, string>, query: Record<string, string> }  = ctx.request;
		
		const response = new Response(ctx);

		try {
			// TODO: Check referrer (___)
			if (! _.has(query, 'ref') || _.isEmpty(query.ref)) {
				throw new ResponseError('No user reference provided.', 400);
			}
			
			const reference = Buffer.from(query.ref, 'base64').toString('utf-8');
			
			console.log({reference});
			
			if ( ! GOCARDLESS_USER_REFERENCE_REGEX.test(reference) ) {
				throw new ResponseError('Invalid user reference.', 400);
			}
			
			const [userUID, walletUID] = reference.split('|');
			
			const user = await strapi.db.query('plugin::users-permissions.user').findOne({
				select: ['id', 'uid'],
				where: { uid: userUID }
			});
			
			// Throw generic error if user is not matched by UID
			if ( ! user ) {
				throw new ResponseError('Invalid user reference.', 400);
			}
			
			const wallet = await strapi.db.query('api::wallet.wallet').findOne({
				select: ['id', 'uid', 'bankRequisitionID'],
				where: { uid: walletUID, user: user.id }
			});
			
			// Throw generic error if wallet is not matched by UID
			if ( ! wallet ) {
				throw new ResponseError('Invalid user reference.', 400);
			}
			
			// Generate new access token. Token is valid for 24 hours
			const bankAccount = await strapi.service('api::bank.bank').getAccountByRequisitionID(wallet.bankRequisitionID);
			
			// Store bank account ID into wallet
			await strapi.entityService.update('api::wallet.wallet', wallet.id, {
				data: { 
					bankAccountID: bankAccount.id, 
					//name: _.isEmpty(wallet.name) ? `${wallet.name} (${bankAccount.name})` : wallet.name, // WARNING: Returns undefined (undefined)
					iban: bankAccount.iban, 
					balance: bankAccount.balance,
					currency: bankAccount.currency,
					lastUpdateAt: new Date().toISOString()
				}
			})
			
			response.setData({ // TODO: Replace with success message
				userID: userUID, walletID: walletUID, query, bankAccount
			})
		} catch (error) {
			response.setError(error);
			response.setStatus(error?.status ?? 400);
		}

		return response.send();
	},
})