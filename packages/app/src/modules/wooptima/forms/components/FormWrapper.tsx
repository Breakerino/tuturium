import React from 'react';
import * as CSS from 'csstype';
import { FlexProps, ResponsiveValue, Flex } from '@chakra-ui/react';
import { SubmitHandler, FieldValues, useFormContext } from 'react-hook-form';

//
import { extractStyledProps, mergeStyles } from '@/modules/wooptima/chakra-extended';

//
import { FormSubmitHandler } from '../types';

interface FormWrapperProps<T = FieldValues> extends Omit<FlexProps, 'onSubmit'> {
	columns?: ResponsiveValue<CSS.Property.ColumnCount>;
	children: React.ReactElement | React.ReactElement[];
	onSubmit: FormSubmitHandler<T>
}

const FormWrapper = React.forwardRef<HTMLFormElement, FormWrapperProps>(({ children, onSubmit: handleSubmit, columns, gap, rowGap, columnGap, ...props }, ref) => {
	const { styles: styleProps, sx, ...componentProps } = extractStyledProps(props);

	const mergedStyles = React.useMemo(() => {
			return mergeStyles(styleProps, sx ?? {});
		}, [styleProps, sx]);
	
	const form = useFormContext();

	const onSubmit: SubmitHandler<FieldValues> = async (values, event) => {
		return await handleSubmit(values, form, event);
	}

	return (
		<Flex as="form" onSubmit={form.handleSubmit(onSubmit)} ref={ref}
			// @ts-ignore TODO Types of property ''--form-column-count'' are incompatible. -  Type 'number' is not assignable to type 'CSSDefinition<CSSWithMultiValues> & CSSWithMultiValues'.
			sx={{
				// @ts-ignore
				'--form-column-count': columns ?? 1,
				// @ts-ignore
				'--form-row-gap': rowGap ?? gap ?? '1rem',
				// @ts-ignore
				'--form-column-gap': columnGap ?? gap ?? '1rem',
				flexDirection: "column",
				width: 'full',
				...mergedStyles
			}}
			{...componentProps}
		>
			{children}
		</Flex>
	)
})


export default FormWrapper;