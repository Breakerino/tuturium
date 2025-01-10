//
import { createMultiStyleConfigHelpers, forwardRef, omitThemingProps, PartsStyleInterpolation, SystemStyleObject, useMultiStyleConfig } from '@chakra-ui/react';
import { AsyncSelect, CSSObjectWithLabel, Select as DefaultSelect, ChakraStylesConfig as ReactSelectStyles } from "chakra-react-select";
import React from 'react';

//
import { cssImportant, mergeStyles } from '@/modules/wooptima/chakra-extended';
import { isArray, isEmpty, isFunction, isNull, isUndefined } from 'lodash';
import { $input, $select } from '../variables';

/**
 * ------------------------------------------------------
 * Styles
 * ------------------------------------------------------
 */
/**
 * ------------------------------------------------------
 * Styles
 * ------------------------------------------------------
 */

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(new Array<keyof ReactSelectStyles>);

// ChakraStylesConfig
// TODO: Support colorScheme
export const baseStyle: PartsStyleInterpolation<{ keys: Array<keyof ReactSelectStyles> }> = {
	control: {
		[$input.height.variable]: "inherit",
		[$input.background.variable]: 'inherit',
		[$input.borderRadius.variable]: "inherit",
		[$input.borderWidth.variable]: 'inherit',
		[$input.borderColor.variable]: 'inherit',
		[$input.fontSize.variable]: 'inherit',
		'--input-padding': 'inherit',
		'&, & + div': {
			//[$select.menu.zIndex.variable]: '300',
			[$select.option.height.variable]: `calc(${$input.height.reference} * 0.85)`,
			[$select.menu.height.variable]: `calc(${$select.option.height.reference} * 4.5)`,
			[$select.spinner.size.variable]: '1.6rem',
		},
		width: '100%',
		border: cssImportant('none'),
		borderRadius: cssImportant(0),
		'&:focus-visible, &[data-focus-visible]': {
			boxShadow: cssImportant('none'),
			borderColor: cssImportant('none'),
		}
	},
	valueContainer: {
		cursor: 'text',
		px: $input.paddingX.reference,
		py: $input.paddingY.reference,
		pl: $input.paddingIcon.reference,
		minHeight: $input.height.reference,
	},
	singleValue: {
		w: '100%',
		overflow: 'hidden'
	},
	inputContainer: {
		overflow: 'hidden'
	},
	input: {
		border: cssImportant('none'),
		outline: cssImportant('none'),
		p: cssImportant('0'),
		m: cssImportant('0')
	},
	placeholder: {
		//display: 'none' // todo
	},
	container: {
		border: cssImportant('none'),
		borderRadius: cssImportant(0),
		width: '100%',
	},
	dropdownIndicator: {
		cursor: 'pointer',
		background: "primary",
		color: 'white',
		p: '1rem',
		borderRadius: `0 calc(${$input.borderRadius.reference} / 2) calc(${$input.borderRadius.reference} / 2) 0`
	},
	indicatorSeparator: {
		display: 'none'
	},
	menu: {
		zIndex: 1000,
	},
	menuList: {
		p: 0,
		maxHeight: $select.menu.height.reference,
		overflowY: 'auto',
		[$input.height.variable]: "inherit",
		[$input.background.variable]: 'inherit',
		[$input.borderRadius.variable]: "inherit",
		[$input.borderWidth.variable]: 'inherit',
		[$input.borderColor.variable]: 'inherit',
		[$input.fontSize.variable]: 'inherit',
		'&::-webkit-scrollbar': {
			width: '0.5rem',
			borderRadius: 'var(--radius-m)',
			background: 'secondary.light'
		},
		'&::-webkit-scrollbar-thumb': {
			background: 'secondary',
			borderRadius: 'var(--radius-m)'
		}
	},
	option: {
		w: '100%',
		minHeight: $select.option.height.reference,
		fontSize: $input.fontSize.reference,
		fontWeight: 400,
		color: 'base',
		px: $input.paddingX.reference,
		py: $input.paddingY.reference,
		//pl: $input.paddingIcon.reference,	
		'&:not([aria-selected]': {
			_hover: {
				background: 'secondary.trans.10',
			},
			_active: {
				background: 'secondary.trans.40',
			}
		},
		_selected: {
			background: 'primary',
			color: 'primary.text',
			_hover: {
				background: 'primary.hover',
			},
			_active: {
				background: 'primary.dark',
			},
		}
	},
	noOptionsMessage: { // todo async show only if necessary
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		w: '100%',
		minHeight: $select.option.height.reference,
		fontSize: $input.fontSize.reference,
		fontWeight: 400,
		color: 'base',
		px: $input.paddingX.reference,
		py: $input.paddingY.reference,
	},
	loadingMessage: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		w: '100%',
		minHeight: $select.option.height.reference,
		fontSize: $input.fontSize.reference,
		fontWeight: 400,
		color: 'base',
		px: $input.paddingX.reference,
		py: $input.paddingY.reference,
	},
	loadingIndicator: {
		'--spinner-size': $select.spinner.size.reference,
		mr: $input.paddingX.reference,
		color: 'primary',
	}
};

export const styles = defineMultiStyleConfig({
	baseStyle,
	defaultProps: {},
});

/**
 * ------------------------------------------------------
 * Component
 * ------------------------------------------------------
 */

// Function to convert baseStyle to chakra-react-select styles
const convertToChakraSelectStyles = (styles: Record<string, SystemStyleObject>): Record<string, (provided: CSSObjectWithLabel) => CSSObjectWithLabel> => {
	return Object.keys(styles).reduce((acc, key) => {
		// @ts-ignore
		acc[key] = (provided: CSSObjectWithLabel) => ({
			...provided,
			...styles[key],
		});
		return acc;
	}, {} as Record<string, (provided: CSSObjectWithLabel) => CSSObjectWithLabel>);
};

// export type ReactSelectProps<Option = unknown, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>> =
//   Props<Option, IsMulti, Group> & React.RefAttributes<SelectInstance<Option, IsMulti, Group>>;

//type ExtractProps<T> = T extends (props: infer P) => any ? P : never;
//export type ReactSelectProps = Parameters<SelectComponent>[0];
export type ReactSelectDefaultProps = React.ComponentProps<typeof DefaultSelect>
export type ReactSelectAsyncProps = React.ComponentProps<typeof AsyncSelect>
//export type ReactSelectProps = React.CustomComponentPropsWithRef<typeof Select>
//export type ReactSelectProps = React.ComponentPropsWithoutRef<typeof Select>

export interface BaseSelectInputProps {
	sx?: Partial<ReactSelectDefaultProps['chakraStyles']>;
	noOptionsMessage?: ReactSelectDefaultProps['noOptionsMessage'] | ReactSelectAsyncProps['noOptionsMessage'] | string | null;
	loadingMessage?: ReactSelectDefaultProps['loadingMessage'] | ReactSelectAsyncProps['loadingMessage'] | string | null;
}

export type DefaultSelectInputProps = BaseSelectInputProps & Omit<ReactSelectDefaultProps, keyof BaseSelectInputProps> & {
	type?: 'select';
};

export type AsyncSelectInputProps = BaseSelectInputProps & Omit<ReactSelectAsyncProps, keyof BaseSelectInputProps> & {
	type: 'async-select';
	loadOptionsDebounce?: number;
	keepLoadedOptions?: boolean;
}

export type SelectInputProps = DefaultSelectInputProps | AsyncSelectInputProps

//export type SelectInputProps = SelectInputTypeProps & BaseSelectInputProps;

export interface SelectOption {
	label: string;
	value: string;
	disabled: boolean;
}

export const SelectTypeToComponent = {
	select: DefaultSelect,
	'async-select': AsyncSelect,
}

//const SelectInput = forwardRef<SelectInputProps, "div">(({ children, ...props }, ref) => {
const SelectInput: React.FC<SelectInputProps> = forwardRef<SelectInputProps, "div">(({ type, ...props }, ref) => {
	//const SelectInput: React.FC<SelectInputProps> = ({ ...props }) => {
	const styles = useMultiStyleConfig('Components/SelectInput', props)
	const { value, ...componentProps }: Partial<SelectInputProps> = omitThemingProps(props)

	// IDEA: abstract complex props transform logic into useSelectInputProps?

	const convertedStyles = React.useMemo(() => {
		// @ts-ignore
		const mergedStyles = mergeStyles(styles, componentProps.sx);
		return convertToChakraSelectStyles(mergedStyles);
	}, [styles]);

	// NOTE: Will not work
	const loadedOptionsRef = React.useRef<SelectOption[]>(
		// @ts-ignore
		(type === 'async-select' && isArray((componentProps as ReactSelectAsyncProps)?.defaultOptions)) ? (componentProps.defaultOptions as SelectOption[]) : []
	);

	// @ts-ignore
	const Select = React.useMemo(() => SelectTypeToComponent[type in SelectTypeToComponent ? type : 'select'], [props]);

	const selectedOption = React.useMemo(() => {
		let options = componentProps?.options ?? [];

		if (type === 'async-select') {
			options = loadedOptionsRef.current;
		}

		// @ts-ignore
		return options?.find((option: SelectOption) => option.value === value);
	}, [type, value]);

	const noOptionsMessage: SelectInputProps['noOptionsMessage'] = React.useMemo(() => {
		//
		if (isUndefined(componentProps?.noOptionsMessage)) {
			return undefined
		}

		// 
		if (isNull(componentProps?.noOptionsMessage)) {
			return () => null;
		}

		//
		if (isFunction(componentProps.noOptionsMessage)) {
			return componentProps.noOptionsMessage;
		}

		//
		//if ((type === 'async-select' && componentProps?.isSearchable !== false) || componentProps?.isSearchable) {
		if (componentProps?.isSearchable !== false) {
			//return ({inputValue}) => inputValue?.length >= 3 ? <>Oh nooo, oh nooo, nič sa nenašlo...</> : null,
			return ({ inputValue }) => inputValue.length >= 3 ? <>{componentProps.noOptionsMessage}</> : null;
		}

		return () => <>{componentProps?.noOptionsMessage}</>;
	}, [componentProps.noOptionsMessage, componentProps?.isSearchable])

	const loadingMessage: SelectInputProps['noOptionsMessage'] = React.useMemo(() => {
		//
		if (isUndefined(componentProps?.loadingMessage)) {
			return undefined
		}

		// 
		if (isNull(componentProps?.loadingMessage)) {
			return () => null;
		}

		//
		if (isFunction(componentProps.loadingMessage)) {
			return componentProps.loadingMessage;
		}

		return () => <>{componentProps?.loadingMessage}</>;
	}, [componentProps.loadingMessage])

	const defaultOptions: AsyncSelectInputProps['defaultOptions'] = React.useMemo(() => {
		if (type !== 'async-select' || !('defaultOptions' in componentProps) || isUndefined(componentProps.defaultOptions)) {
			return undefined;
		}

		if (componentProps.keepLoadedOptions && !isEmpty(loadedOptionsRef.current)) { // && componentProps.defaultOptions === true ?
			return loadedOptionsRef.current;
		}

		return componentProps.defaultOptions;
	}, [componentProps])

	// @ts-ignore
	const handleLoadOptions: ReactSelectAsyncProps['loadOptions'] = (inputValue, callback) => {
		// @ts-ignore
		return 'loadOptions' in props && props.loadOptions(inputValue, (loadedOptions) => {
			loadedOptionsRef.current = loadedOptions as SelectOption[];
			callback(loadedOptions)
		})
	}

	// const handleLoadOptions = React.useMemo(() => (
	// 	(type === 'async-select' && 'loadOptions' in props)
	// 		? ('loadOptionsDebounce' in componentProps && isNumber(componentProps.loadOptionsDebounce) ? debounce(_handleLoadOptions, componentProps.loadOptionsDebounce) : _handleLoadOptions)
	// 		: undefined
	// ), [type]);

	return (<>
		<Select
			// @ts-ignore
			ref={ref}
			chakraStyles={convertedStyles}
			{...{
				value: selectedOption,
				getOptionLabel: ({ label }: SelectOption) => label,
				getOptionValue: ({ value }: SelectOption) => value,
				isOptionDisabled: ({ disabled }: SelectOption) => disabled,

				//isOptionSelected: (option: SelectOption) => option.value === value,
				//isClearable, // todo cleanup handle properly
				//isSearchable // todo test
				...componentProps,

				//
				noOptionsMessage,
				loadingMessage,

				// Async
				loadOptions: type === 'async-select' ? handleLoadOptions : undefined,
				defaultOptions,

				// @ts-ignore
				onChange: ({ value }, meta) => {
					// @ts-ignore
					componentProps.onChange(value ?? '', meta);
				}
			}}
		/>
	</>
	)
})

SelectInput.displayName = 'SelectInput';
SelectInput.defaultProps = {
	type: 'select'
}

export default SelectInput;