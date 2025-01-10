export default {
  routes: [
		{
      method: "POST",
      path: "/actions/assign-merchant-categories",
      handler: "actions.assignMerchantCategories",
    },
		{
      method: "POST",
      path: "/actions/extend-merchant-categories",
      handler: "actions.extendMerchantCategories",
    },
		{
      method: "POST",
      path: "/actions/auto-categorize-transactions",
      handler: "actions.autoCategorizeTransactions",
    },
  ],
};