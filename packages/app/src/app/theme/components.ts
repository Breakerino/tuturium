// Imports > Vendor
import { ThemeComponents } from '@chakra-ui/react';

// Imports > Components > Custom
import { styles as ButtonComponent } from '@/components/Button';
import { styles as FrameComponent } from '@/components/Frame';
import { styles as FormFieldComponent } from '@/modules/wooptima/forms/components/FormField';
import { styles as SelectInputComponent } from '@/modules/wooptima/forms/components/SelectInput';

const components: Partial<ThemeComponents> = {
	Tabs: {
		variants: {
			'spending-overview': {
				tab: {
					borderBottom: '0.1rem solid',
					borderColor: 'purple.800',
					borderTopRadius: 'lg',
					_selected: {
						borderColor: 'purple.500',
						color: 'purple.100'
					},
				},
				tablist: {
				},
				tabpanel: {
				},
			}
		}
	},
	Drawer: {
		baseStyle: {
			overlay: {
				backdropBlur: '20px',
				background: '#08091250'
			},
			dialog: {
				background: 'purple.900',
				minWidth: '32rem',
				maxWidth: '25vw'
			},
			header: {
				fontSize: '2rem',
				color: 'purple.200',
				borderColor: 'purple.800',
				px: '2rem',
				py: '1.75rem'
			},
			body: {
				p: '2rem',
				py: '1.75rem',
				'&::-webkit-scrollbar': {
					width: '5px',
					height: '5px',
					borderRadius: 'xs',
					background: 'purple.700'
				},
				'&::-webkit-scrollbar-thumb': {
					background: 'purple.500',
					borderRadius: 'xs'
				}
			}
		}
	},
	Menu: {
		baseStyle: {
			list: {
				borderRadius: 'sm',
				bg: 'purple.900',
				border: '0.1rem solid',
				borderColor: 'purple.800',
				py: 0,
				overflow: 'hidden'
			},
			groupTitle: {
				fontSize: '1.6rem',
				color: 'purple.100',
				p: '0.9rem 1rem',
				m: 0,
				borderBottom: '0.1rem solid',
				borderColor: 'purple.800'
			},
			item: {
				fontSize: '1.4rem',
				bg: 'transparent',
				color: 'purple.200',
				p: '0.85rem 1rem',
				_hover: {
					bg: 'purple.700',
				}
			},
			divider: {
				borderBottom: '0.1rem solid',
				borderColor: 'purple.500'
			},
		}
	},
	// Components > Chakra
	Button: {
		baseStyle: {
			fontFamily: 'inherit',
			outline: 'none',
			outlineOffset: 'unset',
			border: 'none',
			cursor: 'pointer',
			rounded: "sm",
		},
		sizes: {
			lg: {
				field: {
					height: "auto",
				}
			},
			md: {
				field: {
					height: "auto",
				}
			},
			sm: {
				field: {
					height: "auto",
				}
			},
			xs: {
				field: {
					height: "auto",
				}
			},
		}
	},
	FormLabel: {
		baseStyle: {
			lineHeight: 1.1,
			marginBottom: '3px',
			fontSize: '16px'
		}
	},
	// @ts-ignore
	Checkbox: {
		baseStyle: {
			control: {
				borderWidth: '2px',
				borderColor: 'primary',
				background: 'white',
				_disabled: {
					bg: 'neutral.light.light'
				}
			},
			container: {
				'& .chakra-checkbox__label': {
					fontSize: '1.6rem',
					lineHeight: '1.1',
					marginLeft: '2rem'
				},
				'& .chakra-checkbox__control': {
					height: '2.5rem',
					width: '2.5rem'
				}
			}
		}
	},

	// Components > Custom
	'Components/FormField': FormFieldComponent,
	'Components/SelectInput': SelectInputComponent,
	'Components/Button': ButtonComponent,
	'Components/Frame': FrameComponent,
};

export default components;