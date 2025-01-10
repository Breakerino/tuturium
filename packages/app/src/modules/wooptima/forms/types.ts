import { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * ---------------------------------------------
 * Forms
 * ---------------------------------------------
 */
// @ts-ignore
export type FormSubmitHandler<T = FieldValues> = (data: T, form: UseFormReturn<T, any, undefined>, event?: React.BaseSyntheticEvent) => unknown | Promise<unknown>

export interface FormProps<T = FieldValues> {
	onSubmit: FormSubmitHandler;
	initialData: T;
}