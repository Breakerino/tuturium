// TODO: Auto-register/generate (plop)
// TODO: Enum?
export const AppIcons = {
	// General
	'general.chevron-left': 'general.chevron-left',
	'general.chevron-right': 'general.chevron-right',
	'general.sync': 'general.sync',
	'general.flashlight': 'general.flashlight',
	'general.plus': 'general.plus',
	'general.date': 'general.date',
	
	// Menu
	'menu.dashboard': 'menu.dashboard',
	'menu.wallets': 'menu.wallets',
	'menu.scanner': 'menu.scanner',
	'menu.receipts': 'menu.receipts',
	'menu.spending-overview': 'menu.spending-overview',
}

export interface Wallet {
	uid: string;
	name: string,
	type: 'bank' | 'savings' | 'cash',
	iban?: string;
	balance: number;
	currency: string;
}