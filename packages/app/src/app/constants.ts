import { Wallet } from '@/app/types';

export const DEFAULT_APP_STORE = {}
export const DEFAULT_EVENT_BUS_NAMESPACE = 'tuturium';
export const DEFAULT_EVENT_BUS_LABEL = 'Tuturium';
export const DEFAULT_LOGGER_LABEL = 'Tuturium';

/**
 * --------------------------------
 * Sidebar
 * --------------------------------
 */
export const SIDEBAR_MENU_ITEMS = [
	{
		id: 'dashboard',
		label: 'Dashboard',
		path: '/dashboard'
	},
	{
		id: 'wallets',
		label: 'Wallets',
		path: '/wallets'
	},
	{
		id: 'scanner',
		label: 'Scanner',
		path: '/scanner'
	},
	{
		id: 'receipts',
		label: 'Receipts',
		path: '/receipts'
	},
	{
		id: 'spending-overview',
		label: 'Spendings',
		path: '/spending-overview'
	},
]

/**
 * --------------------------------
 * Translations
 * --------------------------------
 */
export const WALLET_TYPE_LOCALIZATIONS: Record<Wallet['type'], string> = {
	cash: 'Cash',
	bank: 'Bank',
	savings: 'Savings'
}

/**
 * --------------------------------
 * Validation
 * --------------------------------
 */

export const GENERIC_VALIDATION_MESSAGES = {
	required: 'Required field',
};

export const TRANSACTION_VALIDATION_MESSAGES = {
}

export const VALIDATION_MESSAGES = {
	...GENERIC_VALIDATION_MESSAGES,
	...TRANSACTION_VALIDATION_MESSAGES,
}
