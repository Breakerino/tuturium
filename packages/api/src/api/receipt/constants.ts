import _ from 'lodash';
import moment from 'moment';
import { TaxRate } from './types';

export const PRODUCTS_PARSER_GPT_ASSISTENT_ID = 'asst_M5RuhffF8K6hAigAbLKBMaRI'

export const EKASA_RECEIPT_UID_REGEX = /[A-Z]-\b[0-9A-F]{32}\b/;

export const EKASA_RECEIPT_DATA_TRANSFORMER_CONFIG = {
	uid: 'receiptId',
	okp: 'okp',
	issuedAt: {
		_source: 'issueDate',
		_transform: (value: string) => {
			const isoDate = moment(value, 'DD.MM.YYYY HH:mm:ss').toISOString();
			return isoDate;
		}
	},
	createdAt: {
		_source: 'createDate',
		_transform: (value: string) => {
			const isoDate = moment(value, 'DD.MM.YYYY HH:mm:ss').toISOString();
			return isoDate;
		}
	},
	receiptNumber: 'receiptNumber',
	type: 'type',
	exemption: 'exemption',
	items: {
		_source: 'items',
		_type: 'array',
		_mapping: {
			name: {
				_source: 'name',
				_transform: (value: string) => value.trim()
			},
			type: 'itemType',
			quantity: 'quantity',
			vatRate: {
				_source: 'vatRate',
				_transform: (value: number) => TaxRate[Number(value.toFixed(0))].toLowerCase()
			},
			price: 'price',
			unit: {
				_source: 'quantity',
				_transform: (value: number) => _.isInteger(value) ? 'pc' : 'kg'
			},
			categories: {
				_source: 'name', // temp
				_transform: () => []
			}
		}
	},
	total: 'totalPrice',
	taxes: {
		_type: 'array',
		_mapping: [
			{
				name: "standard",
				baseAmount: 'taxBaseBasic',
				vatRate: 'vatRateBasic',
				vatAmount: 'vatAmountBasic'
			},
			{
				name: "reduced",
				baseAmount: 'taxBaseReduced',
				vatRate: 'vatRateReduced',
				vatAmount: 'vatAmountReduced'
			},
			{
				name: "zero",
				baseAmount: 'freeTaxAmount',
				vatRate: 0,
				vatAmount: 0
			}
		]
	},
	store: {
		uid: null,
		name: 'organization.name',
		unitType: 'unit.unitType',
		streetAddress: {
			_source: 'unit.streetName',
			_transform: (address: string, data: Record<string, any>) => `${address} ${data.unit.propertyRegistrationNumber && data.unit.buildingNumber ? data.unit.propertyRegistrationNumber + '/' + data.unit.buildingNumber : (data.unit.propertyRegistrationNumber || data.unit.buildingNumber || '')}`
		},
		city: 'unit.municipality',
		postalCode: 'unit.postalCode',
		country: 'unit.country',
		organization: {
			name: 'organization.name',
			companyID: 'organization.ico',
			companyTaxID: 'organization.dic',
			companyVatID: 'organization.icDph',
			isVatPayer: 'organization.vatPayer'
		}
	}
};