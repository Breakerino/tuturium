import * as yup from "yup"

export const transactionCreateSchema = yup.object({
	date: yup
		.string()
		.required({ name: 'required' }),
	amount: yup
		.number()
		.required({ name: 'required' }),
	description: yup
		.string()
		.optional(),
	category: yup
		.string()
		.required({ name: 'required' }),
})

export const receiptCreateSchema = yup.object({
	uid: yup
		.string()
		.required({ name: 'required' }),
})