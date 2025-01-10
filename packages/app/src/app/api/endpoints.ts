import { EndpointsArgs } from '.';

type EndpointName = 'loginUser' | 'createReceipt' | 'getReceipts' | 'getReceipt' | 'getTransactions' | 'getTransaction' | 'getTransactionCategories' | 'createTransaction' |'getWallets' | 'getWallet' | 'syncWallet' | 'getSpendingReport' | 'getSpendingReportTransactionCategory' | 'getSpendingReportProductCategory' | 'updateUser';

const endpoints: Record<EndpointName, EndpointsArgs> = {
	loginUser: {
		url: '/auth/local',
		method: 'POST',
		access: 'public',
		data: {
			identifier: "",
			password: "",
		},
	},
	createReceipt: {
		url: '/receipts',
		method: 'POST',
		access: 'private',
		data: {
			uid: ""
		},
	},
	getReceipts: {
		url: '/receipts',
		method: 'GET',
		access: 'private',
	},
	getReceipt: {
		url: '/receipts/:uid',
		method: 'GET',
		access: 'private',
		urlParams: {
			uid: ''
		},
	},
	getTransactions: {
		url: '/transactions',
		method: 'GET',
		access: 'private',
	},
	getTransaction: {
		url: '/transactions/:id',
		method: 'GET',
		access: 'private',
		urlParams: {
			id: ''
		},
	},
	getTransactionCategories: {
		url: '/transaction-categories?pagination[pageSize]=100',
		method: 'GET',
		access: 'private',
	},
	createTransaction: {
		url: '/transactions',
		method: 'POST',
		access: 'private',
	},
	getWallets: {
		url: '/wallets',
		method: 'GET',
		access: 'private',
	},
	getWallet: {
		url: '/wallets/:uid',
		method: 'GET',
		access: 'private',
		urlParams: {
			uid: ''
		},
	},
	syncWallet: {
		url: '/wallets/sync/:uid',
		method: 'POST',
		access: 'private',
		urlParams: {
			uid: ''
		},
	},
	getSpendingReport: {
		url: '/spending-report',
		method: 'GET',
		access: 'private',
	},
	getSpendingReportTransactionCategory: {
		url: '/spending-report/categories/transaction/:uid',
		method: 'GET',
		access: 'private',
		urlParams: {
			uid: ''
		}
	},
	getSpendingReportProductCategory: {
		url: '/spending-report/categories/product/:uid',
		method: 'GET',
		access: 'private',
		urlParams: {
			uid: ''
		}
	},
	updateUser: {
		url: '/user',
		method: 'PUT',
		access: 'private',
		data: {
			username: '',
			password: ''			
		}
	},
};

export default endpoints;