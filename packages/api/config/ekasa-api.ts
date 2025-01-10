export default (({env}) => ({
	baseURL: `https://ekasa.financnasprava.sk/mdu/api/v1`,
	timeout: 5000,
	routes: {
		findReceipt: {
			path: '/opd/receipt/find',
			method: 'POST',
			data: {
				receiptId: ''
			}
		},
	},
	headers: {
		'Content-Type': 'application/json'
	},
}))