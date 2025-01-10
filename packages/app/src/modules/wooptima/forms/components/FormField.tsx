//
import { Box, chakra, InputProps as ChakraInputProps, createMultiStyleConfigHelpers, FormControl, FormControlProps, FormErrorMessage, FormHelperText, FormLabel, Input, InputGroup, InputLeftElement, InputRightElement, omitThemingProps, ResponsiveValue, Spinner, Textarea, useMultiStyleConfig, type ComponentMultiStyleConfig } from '@chakra-ui/react';
import * as CSS from 'csstype';
import { isEmpty, isString } from 'lodash';
import React from 'react';
import { FieldValues, useController, useFormContext, Validate } from 'react-hook-form';

//
import { AppIcons } from '@/app/types';
import Icon from '@/components/Icon';
import { cssImportant, extractStyledProps } from '@/modules/wooptima/chakra-extended';
import { $input } from '../constants';
import SelectInput, { DefaultSelectInputProps } from './SelectInput';

/**
 * ------------------------------------------------------
 * Styles
 * ------------------------------------------------------
 */

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers([
	'root',
	'label',
	'labelWrapper',
	'labelText',
	'labelIndicator',
	'labelAddon',
	'inputIcon',
	'inputWrapper',
	'inputElement',
	'errorMessage',
	'description'
]);


export const baseStyle: ComponentMultiStyleConfig['baseStyle'] = {
	root: {
		'--form-column-span': 'calc(12 / var(--form-column-count))',
		gridColumn: 'span var(--form-column-span)',
		width: 'full',
		display: 'flex',
		flexDirection: 'column',
		container: 'form-field-root / inline-size',
		zIndex: 1,
		//position: 'relative',
		color: 'purple.200',
		[$input.background.variable]: 'colors.purple.800',
		[$input.borderRadius.variable]: "radii.sm",
		[$input.borderWidth.variable]: '0.2rem',
		[$input.borderColor.variable]: 'colors.purple.700',
		[$input.paddingIcon.variable]: $input.paddingX.reference,
		'&[data-has-icon]': {
			[$input.paddingIcon.variable]: $input.height.reference
		},
	},
	label: {
		display: 'flex',
		flexFlow: 'row wrap',
		justifyContent: 'space-between',
		margin: 0,
		_groupDisabled: {
			opacity: 1
		}
	},
	labelWrapper: {
		display: 'flex',
	},
	labelIndicator: {
		display: 'flex',
		alignItems: 'center',
		gap: '0.5rem',
		ml: '0.25rem',
		//pr: '1rem',
		mr: 'auto'
	},
	labelText: {
		fontSize: '1.6rem',
		fontWeight: 500,
		lineHeight: 1.15,
		color: 'purple.200'
	},
	inputWrapper: {
		[$input.height.variable]: "inherit",
		[$input.background.variable]: 'inherit',
		[$input.borderRadius.variable]: "inherit",
		[$input.borderWidth.variable]: 'inherit',
		[$input.borderColor.variable]: 'inherit',
		[$input.fontSize.variable]: 'inherit',
		width: 'full',
		p: cssImportant(0),
		background: cssImportant($input.background.reference),
		transitionDuration: '300ms',
		transitionProperty: 'all',
		transitionTimingFunction: 'ease-in-out',
		mt: '0.25rem',
		lineHeight: 1,
		fontWeight: 400,
		color: 'base',
		borderWidth: $input.borderWidth.reference,
		borderColor: $input.borderColor.reference,
		borderRadius: $input.borderRadius.reference,
		borderStyle: 'solid',
		'&:has(input:focus-visible)': {
			[$input.borderColor.variable]: 'colors.primary.500',
		},
		// Is valid indictator
		// TODO: Only if enabled
		// '&[data-is-dirty][data-is-focused]:not([aria-invalid=true])': {
		// 	[$input.borderColor.variable]: 'colors.primary',
		// },
		// Is changed indictator
		// TODO: Only if enabled
		'&:not([data-is-focused])[data-is-dirty]': {
			[$input.borderColor.variable]: 'colors.purple.400',
		},
		'&:is([aria-invalid=true])[data-is-dirty]': {
			[$input.borderColor.variable]: 'colors.accent'
		}
	},
	inputElement: { // TODO select merge to .control
		[$input.height.variable]: "inherit",
		[$input.background.variable]: 'inherit',
		[$input.borderRadius.variable]: "inherit",
		[$input.borderWidth.variable]: 'inherit',
		[$input.borderColor.variable]: 'inherit',
		[$input.fontSize.variable]: 'inherit',
		fontSize: $input.fontSize.reference,
		paddingX: $input.paddingX.reference,
		paddingY: $input.paddingY.reference,
		paddingLeft: $input.paddingIcon.reference,
		border: cssImportant('none'),
		outline: cssImportant('none'),
		boxShadow: cssImportant('none'),
		background: cssImportant('transparent'),
		color: cssImportant('inherit'),
		borderRadius: cssImportant('none'),
		_focus: {
			border: cssImportant('none'),
			outline: cssImportant('none'),
			boxShadow: cssImportant('none')
		},
		_placeholder: {
			color: 'neutral',
			lineHeight: 1,
			fontWeight: 400,
		},
	},
	inputIcon: {
		_groupDisabled: {
			opacity: 0.5
		}
	},
	inputAddon: {
		mt: '0.25rem',
		pr: '0.75rem',
		pointerEvents: 'none'
	},
	errorMessage: {
		fontSize: '1.4rem',
		mt: '0.25rem',
	},
	description: {
		fontSize: '1.4rem',
		mt: '0.25rem',
	},
	footerAddon: {
		mt: '0.25rem',
	},
};

export const sizes: ComponentMultiStyleConfig['sizes'] = {
	sm: definePartsStyle({

	}),
	md: definePartsStyle({
		root: {
			[$input.height.variable]: "5rem",
			[$input.iconSize.variable]: '2.2rem',
			[$input.paddingX.variable]: {
				base: '1rem',
				md: '2rem',
				//cq: {
				//	base: '1rem',
				//	500: '2rem'
				//}
			},
			[$input.paddingY.variable]: {
				base: '0.5rem',
				//cq: {
				//	base: '1rem',
				//	500: '2rem'
				//}
			},
			[$input.fontSize.variable]: {
				base: '1.6rem',
				md: '1.8rem',
				//cq: {
				//	base: '1.6rem',
				//	500: '1.8rem'
				//}
			},
		},
		inputElement: {
			minHeight: $input.height.reference,
			width: "full",
		}
	}),
	lg: definePartsStyle({

	}),
};

// TODO better naming (labelTop, labelPlaceholder)
export const variants: ComponentMultiStyleConfig['variants'] = {
	static: definePartsStyle({

	}),
	dynamic: definePartsStyle({
		root: {
			position: 'relative',
			'&[data-has-value], &[data-focus]': {
				'&[data-has-icon]': {
					'.form-field-label__wrapper': {
						[$input.paddingIcon.variable]: `calc((${$input.height.reference} - ${$input.iconSize.reference}) / 2)`
					}
				},
				'.form-field-label__wrapper': {
					transform: `translate(calc(${$input.paddingIcon.reference} - calc(0.5rem / 2)), 1.6rem) scale(0.8)`,
					background: `linear-gradient(180deg, var(--background) 50%, ${$input.background.reference} 50%)`
				},
				'.form-field-label__text': {
					color: 'secondary',
				},
			}
		},
		labelWrapper: {
			position: 'relative',
			top: 0,
			left: 0,
			zIndex: 10,
			px: '0.5rem',
			transform: `translate(calc(${$input.paddingIcon.reference} - calc(0.5rem / 2)), 4rem) scale(1)`,
			transition: 'transform 150ms ease-in-out',
			transformOrigin: 'left top',
		},
		labelText: {
			color: 'purple.200',
			fontWeight: 400,
			transition: 'all 200ms ease-in-out',
			cursor: 'text',
			_groupHover: {
				color: 'purple.100',
			},
			_groupFocus: {
				color: 'purple.100',
				pointerEvents: 'none'
			},
		},
		inputElement: {
			_placeholder: {
				opacity: 0,
				_groupFocus: {
					opacity: 1
				}
			},
		}
	}),
};

export const styles = defineMultiStyleConfig({
	baseStyle,
	sizes,
	variants,
	defaultProps: {
		size: 'md',
		variant: 'default'
	},
});

/**
 * ------------------------------------------------------
 * Component
 * ------------------------------------------------------
 */
export const InputTypeToComponent = {
	default: Input,
	//checkbox: Checkbox,
	//radio: Radio,
	textarea: Textarea,
	select: SelectInput,
	'async-select': SelectInput
}

interface FormFieldBaseProps extends FormControlProps, Pick<ChakraInputProps, 'name' | 'placeholder' | 'isDisabled' | 'isRequired'> {
	labelIndicator?: React.ReactElement, // ?
	labelAddon?: React.ReactElement,
	description?: string;
	inputAddon?: React.ReactElement,
	footerAddon?: React.ReactElement,
	ref?: React.RefObject<HTMLFieldSetElement>,
	icon?: keyof typeof AppIcons | React.ReactElement
	//iconColor
	//iconSize
	variant?: keyof typeof variants,
	columnSpan?: ResponsiveValue<CSS.Property.ColumnCount>;
	validation?: Record<string, Validate<any, FieldValues>>
	inputRef?: React.RefObject<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
}

type FormFieldDefaultInputProps = {
	type?:
	| "text"
	| "number"
	| "password"
	| "email"
	| "tel"
	| "url"
	| "search"
	| "date"
	| "time"
	| "datetime-local"
	| "month"
	| "week"
	| "color"
	inputProps?: React.ComponentProps<typeof InputTypeToComponent['default']>
}

type FormFieldTextAreaInputProps = {
	type: 'textarea'
	inputProps?: React.ComponentProps<typeof InputTypeToComponent['textarea']>
}

type FormFieldSelectInputProps = {
	type: 'select'
	inputProps?: DefaultSelectInputProps
	//inputProps?: ReactSelectDefaultProps
}

type FormFieldAsyncSelectInputProps = {
	type: 'async-select'
	inputProps?: React.ComponentProps<typeof InputTypeToComponent['async-select']>
	//inputProps?: ReactSelectDefaultProps
}

// type FormFieldCheckboxInputProps = {
// 	type: 'checkbox'
// 	inputProps?: React.ComponentProps<typeof InputTypeToComponent['checkbox']>
// }

// type FormFieldRadioInputProps = {
// 	type: 'radio'
// 	inputProps?: React.ComponentProps<typeof InputTypeToComponent['radio']>
// }

type FormFieldCustomInputProps<T> = {
	type: 'custom'
	inputComponent: T
	inputProps?: T extends React.ElementType ? React.ComponentProps<T> : never;
}

type FormFieldInputTypeProps<T> =
	| FormFieldDefaultInputProps
	//| FormFieldCheckboxInputProps
	//| FormFieldRadioInputProps
	| FormFieldSelectInputProps
	| FormFieldAsyncSelectInputProps
	| FormFieldTextAreaInputProps
	| FormFieldCustomInputProps<T>;

export type FormFieldProps<T extends React.ElementType> = FormFieldBaseProps & FormFieldInputTypeProps<T>;
//export type FormFieldProps<T extends React.ElementType> = FormFieldBaseProps & ( FormFieldCustomInputProps<T>  | FormFieldTextAreaInputProps)

//const FormField: React.FC = forwardRef<FormFieldProps<any>, "fieldset">(({ ...props }, ref) => {
const FormField = <T extends React.ElementType>({ ...props }: FormFieldProps<T>) => {
	const styles = useMultiStyleConfig('Components/FormField', props)

	const {
		name,
		type = 'text',
		labelAddon,
		labelIndicator,
		label,
		icon,
		placeholder,
		description,
		inputAddon,
		footerAddon,
		columnSpan,
		inputProps,
		isDisabled: disabled,
		isRequired: required,
		validation,
		...controlProps
	} = omitThemingProps(props)

	const { styles: styleProps, ...componentProps } = extractStyledProps(controlProps);

	const {
		field,
		fieldState: { error, invalid: isInvalid, isTouched, isDirty, isValidating },
		formState: { isLoading, isSubmitting },
	} = useController({
		// @ts-ignore
		name,
		rules: {
			required: !disabled ? required : undefined,
			validate: !disabled ? validation : undefined
		},
	});

	const isDisabled = disabled || isLoading || isSubmitting; // NOTE: isValidating causes fucking unexpected behaviour, workaround data-is-validating for async (debounced)
	const [isFocused, setIsFocused] = React.useState<boolean>(false);

	const form = useFormContext();

	// @ts-ignore
	const InputComponent = React.useMemo(() => (props.type === 'custom' ? props.inputComponent : null) ?? InputTypeToComponent[type in InputTypeToComponent ? type : 'default'], [props]);

	// NOTE: Experimental - Trigger validation if focused and touched input was invalid to revalidate on input (user correction attempt)
	// TODO: Move to inner FormInput component, take focus state from the compoonent (formcontrol > data-focus)
	React.useEffect(() => {
		if (isTouched && isFocused && !isValidating && isInvalid) {
			form.trigger(name, { shouldFocus: true });
		}
	}, [field.value]);

	return (
		/* <FormControl> */
		<FormControl {...componentProps} sx={{
			...styles.root,
			...styleProps,
			...(columnSpan ? { '--form-column-span': columnSpan } : {})
		}}
			isDisabled={isDisabled}
			isInvalid={isInvalid}
			data-has-value={!isEmpty(field.value) ? true : undefined}
			data-is-focused={isFocused ? '' : undefined}
			data-has-icon={icon ? '' : undefined}
		>
			{label && (
				/* <FormLabel> */
				<FormLabel sx={styles.label}>
					<chakra.div __css={styles.labelWrapper} className="form-field-label__wrapper">
						{/* <FormLabelText> */}
						<chakra.span __css={styles.labelText} className="form-field-label__text">{label}</chakra.span>

						{/* <FormLabelIndicator> */}
						<chakra.div __css={styles.labelIndicator}>
							{required && <chakra.span aria-label="required" color='accent'>*</chakra.span>}
							{isLoading && <Spinner colorScheme="purple" />}
							{React.isValidElement(labelIndicator) && labelIndicator}
						</chakra.div>
						{/* </FormLabelIndicator> */}
					</chakra.div>

					{/* <FormLabelAddon> */}
					{labelAddon && (
						<chakra.div __css={styles.labelAddon} children={labelAddon} />
					)}
					{/* </FormLabelAddon> */}
				</FormLabel>
				/* </FormLabel> */
			)}

			{/* <FormInput> */}
			<InputGroup as="fieldset"
				sx={styles.inputWrapper}
				data-is-dirty={isDirty ? '' : undefined}
				data-is-focused={isFocused ? '' : undefined}
				aria-invalid={isInvalid}
			>
				{icon && (
					<InputLeftElement sx={styles.inputIcon} >
						{isString(icon) ? <Icon id={icon} size={$input.iconSize.reference} /> : icon}
					</InputLeftElement>
				)}
				<InputComponent
					sx={styles.inputElement}
					{...{
						...field,
						type, placeholder,
						onFocus: () => {
							setIsFocused(true);
						},
						onBlur: () => {
							setIsFocused(false);
							field.onBlur();
						},
						...inputProps // TODO: Omit certain reserved props (onChange, value, ...)
					}}
				/>
				{inputAddon && (
					<InputRightElement sx={styles.inputAddon} children={inputAddon} /> 
				)}
			</InputGroup>
			{/* </FormInput> */}

			{/* <FormErrorMessage> */}
			{!isEmpty(error?.message) && (
				<FormErrorMessage sx={styles.errorMessage} children={error?.message} />
			)}

			{/* </FormErrorMessage> */}

			{/* <FormDescription> */}
			{description && (
				<FormHelperText sx={styles.description} children={description} />
			)}

			{footerAddon && (
				<Box sx={styles.footerAddon} children={footerAddon} />
			)}
			{/* </FormDescription> */}
		</FormControl>
	)
}

FormField.displayName = 'FormField';

export default FormField;