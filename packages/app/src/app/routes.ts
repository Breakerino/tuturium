import { AppRoute } from '@/modules/AppRouter/types';

type AppRouteType = 'index' | 'login' | 'dashboard' | 'wallets' | 'wallet' | 'transaction-category' | 'transaction' | 'scanner' | 'receipts' | 'receipt' | 'spending-overview' | 'product-category' | 'profile-settings';

const routes: Record<AppRouteType, AppRoute> = {
	index: {
		name: 'index',
		title: 'Home',
		path: '/',
		type: 'global',
		layout: 'guest'
	},
	login: {
		name: 'login',
		title: 'Login',
		path: '/login',
		type: 'public',
		layout: 'guest'
	},
	dashboard: {
		name: 'dashboard',
		title: 'Dashboard',
		path: '/dashboard',
		type: 'private'
	},
	wallet: {
		name: 'wallet',
		title: 'Wallet',
		path: '/wallets/:uid',
		type: 'private'
	},
	wallets: {
		name: 'wallets',
		title: 'Wallets',
		path: '/wallets',
		type: 'private'
	},
	'transaction-category': {
		name: 'transaction-category',
		title: 'Transaction category',
		path: '/transactions/category/:uid',
		type: 'private'
	},
	transaction: {
		name: 'transaction',
		title: 'Transaction',
		path: '/transactions/:id',
		type: 'private'
	},
	scanner: {
		name: 'scanner',
		title: 'Scanner',
		path: '/scanner',
		type: 'private'
	},
	receipt: {
		name: 'receipt',
		title: 'Receipt',
		path: '/receipts/:uid',
		type: 'private'
	},
	receipts: {
		name: 'receipts',
		title: 'Receipts',
		path: '/receipts',
		type: 'private'
	},
	'spending-overview': {
		name: 'spending-overview',
		title: 'Spending overview',
		path: '/spending-overview',
		type: 'private'
	},
	'product-category': {
		name: 'product-category',
		title: 'Product category',
		path: '/products/category/:uid',
		type: 'private'
	},
	'profile-settings': {
		name: 'profile-settings',
		title: 'Settings',
		path: '/profile/settings',
		type: 'private'
	},
};

export default routes;