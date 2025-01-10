//
import DataTransformer from '../../../modules/DataTransformer';
import { GOCARDLESS_CLIENT, GOCARDLESS_CONFIRM_REDIRECT_URL, GOCARDLESS_TRANSACTION_DATA_TRANSFORMER_CONFIG } from '../constants';

export default ({ strapi }) => ({
	/**
	 * Initialize bank connect session
	 * 
	 * @param bankInstitutionID 
	 * @param referenceID
	 * @returns object
	 */
	async initSession({bankInstitutionID, bankReferenceID}) {
		try {
			// Generate new access token
			await GOCARDLESS_CLIENT.generateToken();

			// Initialize bank link session
			// @ts-ignore
			const session = await GOCARDLESS_CLIENT.initSession({
				// TODO: Redirect to api endpoint (with temp token) which will mark user as successfuly connected to gocardless (lastUpdatedAt) 
				// TODO: GET /bank/sync/confirm (with ?ref={{user.uid}}) + check referrer
				// TODO: Include one-time token for redirection to identify user (store token in users table)
				redirectUrl: GOCARDLESS_CONFIRM_REDIRECT_URL,
				institutionId: bankInstitutionID,
				referenceId: bankReferenceID
			})

			return session;
		} catch (error) {
			console.error(error.data);
			return null;
		}
	},

	/**
	 * Retrieve bank account data
	 * 
	 * @param bankRequisitionID
	 * @returns object
	 */
	async getAccountByRequisitionID(bankRequisitionID) {
		try {
			// Generate new access token
			await GOCARDLESS_CLIENT.generateToken();

			// Retrieve requisition data
			const requisitionData = await GOCARDLESS_CLIENT.requisition.getRequisitionById(bankRequisitionID);
				
			const bankAccountID = [...requisitionData.accounts].shift();
			const accountData = this.getAccountData(bankAccountID);
			
			return {
				id: bankAccountID,
				...accountData
			};
		} catch (error) {
			console.error(error)
			return null;
		}
	},

	/**
	 * Parse bank transaction data
	 * 
	 * @param transaction 
	 * @returns 
	 */
	async parseTransaction(transaction) {
		return await DataTransformer.transform(transaction, GOCARDLESS_TRANSACTION_DATA_TRANSFORMER_CONFIG);
	},

	/**
	 * Retrieve bank account transactions
	 * 
	 * @param bankAccountID
	 * @returns 
	 */
	async getAccountData(bankAccountID) {
		// Generate new access token
		await GOCARDLESS_CLIENT.generateToken();

		// Retrieve bank account instance
		const account = GOCARDLESS_CLIENT.account(bankAccountID);
		
		const accountBalances = (await account.getBalances()).balances;
		const accountDetails = (await account.getDetails()).account;

		return {
			uid: accountDetails.resourceId,
			iban: accountDetails.iban,
			name: accountDetails.name,
			balance: accountBalances.find(({balanceType}) => balanceType === 'interimBooked')?.balanceAmount?.amount ?? null,
			currency: accountDetails.currency,
		}
	},
	
	/**
	 * Retrieve bank account transactions
	 * 
	 * @param bankAccountID
	 * @param dateFrom
	 * @param dateTo
	 * @returns 
	 */
	async getAccountTransactions({bankAccountID, dateFrom, dateTo}) {
		// Generate new access token
		await GOCARDLESS_CLIENT.generateToken();

		// Retrieve bank account instance
		const account = GOCARDLESS_CLIENT.account(bankAccountID);
		
		// @ts-ignore
		const accountTransactions = (await account.getTransactions({dateFrom, dateTo})).transactions;

		const parsedTransactions = [];

		for (const [status, transactions] of Object.entries<any>(accountTransactions)) {
			for (const transaction of transactions) {
				const parsedTransaction = await this.parseTransaction(transaction)
				parsedTransactions.push({ ...parsedTransaction, status, })
			}
		}

		return parsedTransactions;
	}
});