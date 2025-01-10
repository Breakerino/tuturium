export default (({env}) => ({
	apiKey: env('OPENAI_API_KEY', ''),
	assistents: {
		multi_product_categorizer: 'asst_um8V5f6GQMlJ9V3bSXWr5kNy',
		multi_product_name_normalizer: 'asst_deCENUW9vdQchfuEnj72rBOP',
		multi_transaction_category_to_mcc: 'asst_Zm1FH8QMFvMvbutrX7Zfkr7N',
		single_transaction_category_mcc_extend: 'asst_yy4koey4lCjHESLaenKO2bUp'
	}
}))