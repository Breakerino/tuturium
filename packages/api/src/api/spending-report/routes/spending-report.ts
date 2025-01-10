export default {
  routes: [
    {
     method: 'GET',
     path: '/spending-report',
     handler: 'spending-report.retrieve',
     config: {
       policies: [],
       middlewares: [],
     },
    },
		{
			method: 'GET',
			path: '/spending-report/categories/transaction/:uid',
			handler: 'spending-report.getTransactionCategory',
			config: {
				policies: [],
				middlewares: [],
			},
		 },
		{
			method: 'GET',
			path: '/spending-report/categories/product/:uid',
			handler: 'spending-report.getProductCategory',
			config: {
				policies: [],
				middlewares: [],
			},
		 },
  ],
};
