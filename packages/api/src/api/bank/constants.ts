//
import NordigenClient from 'nordigen-node';
import _ from 'lodash';

// @ts-ignore
export const GOCARDLESS_CLIENT = new NordigenClient({
	secretId: process.env.GOCARDLESS_SECRET_ID,
	secretKey: process.env.GOCARDLESS_SECRET_KEY
});

export const GOCARDLESS_CONFIRM_REDIRECT_URL = `${process.env.API_SERVER_PROTOCOL}://${process.env.API_SERVER_NAME}/api/bank/connect/confirm`;

export const GOCARDLESS_USER_REFERENCE_REGEX = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
//export const GOCARDLESS_USER_REFERENCE_REGEX = "/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/";
//export const GOCARDLESS_USER_REFERENCE_REGEX = "/^([0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12})\|\1$/";

export const GOCARDLESS_TRANSACTION_DATA_TRANSFORMER_CONFIG = {
	externalID: {
		_source: 'internalTransactionId',
		_transform: (value: string) => !_.isEmpty(value) ? value : null
	},
	transactionID: {
		_source: 'transactionId',
		_transform: (value: string) => !_.isEmpty(value) ? value : null
	},
	postingDate: {
		_source: 'bookingDate',
		_transform: (value: string) => !_.isEmpty(value) ? value : null
	},
	valueDate: {
		_source: 'valueDate',
		_transform: (value: string) => !_.isEmpty(value) ? value : null
	},
	amount: {
		_source: 'transactionAmount.amount',
		_transform: (value: string) => Number(value)
	},
	currency: 'transactionAmount.currency',
	currencyExchange: {
		_source: 'currencyExchange[0]',
		_transform: (value: string) => JSON.stringify(value)
	},
	variableSymbol: {
		_source: 'remittanceInformationStructured',
		_transform: (value: string) => JSON.parse(value)?.find(item => item.referenceType === 'VariableSymbol')?.reference ?? null
	},
	specificSymbol: {
		_source: 'remittanceInformationStructured',
		_transform: (value: string) => JSON.parse(value)?.find(item => item.referenceType === 'SpecificSymbol')?.reference ?? null
	},
	constantSymbol: {
		_source: 'remittanceInformationStructured',
		_transform: (value: string) => JSON.parse(value)?.find(item => item.referenceType === 'ConstantSymbol')?.reference ?? null
	},
	creditor: {
		name: {
			_source: 'creditorName',
			_transform: (value: string) => !_.isEmpty(value) ? value : null
		},
		iban: {
			_source: 'creditorAccount.iban',
			_transform: (value: string) => !_.isEmpty(value) ? value : null
		},
		currency: {
			_source: 'creditorAccount.currency',
			_transform: (value: string) => !_.isEmpty(value) ? value : null
		},
		agent: {
			_source: 'creditorAgent',
			_transform: (value: string) => !_.isEmpty(value) ? value : null
		}
	},
	debtor: {
		name: {
			_source: 'debtorName',
			_transform: (value: string) => !_.isEmpty(value) ? value : null
		},
		iban: {
			_source: 'debtorAccount.iban',
			_transform: (value: string) => !_.isEmpty(value) ? value : null
		},
		currency: {
			_source: 'debtorAccount.currency',
			_transform: (value: string) => !_.isEmpty(value) ? value : null
		},
		agent: {
			_source: 'debtorAgent',
			_transform: (value: string) => !_.isEmpty(value) ? value : null
		}
	},
	bankTransactionCode: {
		_source: 'bankTransactionCode',
		_transform: (value: string) => !_.isEmpty(value) ? value : null
	},
	merchantCategoryCode: {
		_source: 'merchantCategoryCode',
		_transform: (value: string) => !_.isEmpty(value) ? _.padStart(value.toString(), 4, '0') : null
	},
	description: {
		_source: 'remittanceInformationUnstructured',
		_transform: (value: string) => !_.isEmpty(value) ? value : null
	},
	additionalInformation: {
		_source: 'additionalInformation',
		_transform: (value: string) => !_.isEmpty(value) ? value : null
	}
};