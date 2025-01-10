import { extractStyledProps } from '@/modules/wooptima/chakra-extended/functions';
import { chakra, Button as ChakraButton, ButtonProps as ChakraButtonProps, Flex, forwardRef, omitThemingProps, useMultiStyleConfig, type ComponentStyleConfig } from '@chakra-ui/react';
import Icon, {IconProps} from '@/components/Icon';
import { Link as RouterLink } from "react-router-dom";

const variants: ComponentStyleConfig['variants'] = {
	solid: (props) => ({
		root: {
			background: `${props.colorScheme}`,
			color: `${props.colorScheme}.text`,
			_hover: {
				background: `${props.colorScheme}.hover`,
			},
			_active: {
				background: `${props.colorScheme}.dark`,
			},
		}
	}),
	outline: (props) => ({
		root: {
			bg: 'unset',
			color: `${props.colorScheme}`,
			borderColor: `${props.colorScheme}`,
			borderWidth: '0.2rem',
			borderStyle: 'solid',
			_hover: {
				background: `${props.colorScheme}`,
				color: `${props.colorScheme}.text`,
			},
			_active: {
				background: `${props.colorScheme}.dark`,
				color: `${props.colorScheme}.text`,
			},
		}
	}),
	ghost: (props) => ({
		root: {
			bg: 'unset',
			color: `${props.colorScheme}`,
			_active: {
				bg: 'none'
			}
		}
	}),
	underline: (props) => ({
		root: {
			bg: 'unset',
			color: `${props.colorScheme}`,
			textDecoration: 'underline',
			p: 0,
			_active: {
				bg: 'none'
			}
		}
	}),
	'circle-icon': (props) => ({
		root: {
			background: `${props.colorScheme}`,
			color: `${props.colorScheme}.text`,
			_hover: {
				background: `${props.colorScheme}.hover`,
			},
			_active: {
				background: `${props.colorScheme}.dark`,
			},
			
			width: '3.6rem',
			height: '3.6rem',
			borderRadius: '50%',
			padding: 0,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			'.chakra-button__icon': {
				margin: 0
			}
		}
	}),
	menu: () => ({
		root: {
			display: 'flex',
			flexDirection: {
				base: 'column',
				lg: 'row'
			},
			'.chakra-button__icon': {
				mr: {
					base: 0,
					lg: '1rem'
				},
				mb: {
					base: '1rem',
					lg: 0,
				}
			},
			background: `transparent`,
			color: `purple.300`,
			justifyContent: 'flex-start',
			borderRadius: 'xs',
			position: 'relative',
			_before: {
				content: {
					lg: '""'
				},
				position: 'absolute',
				top: 0,
				left: 0,
				width: '0.2rem',
				height: '100%',
				background: 'currentColor',
				opacity: 0
			},
			_hover: {
				color: 'purple.200',
				_before: {
					opacity: 1
				}
			},
			_active: {
				color: 'purple.100',
				_before: {
					opacity: 1,
				}
			},
		}
	})
};

const sizes: ComponentStyleConfig['sizes'] = {
	xs: ({variant}) => ({
		root: {
			p: '1rem 1.8rem',
			fontWeight: ! ['underline'].includes(variant) ? 500 : 400,
			fontSize: {
				base: '1.4rem',
				md: '1.6rem'
			}
		},
		text: {
		},
		subtext: {
			fontSize: '89%'
		},
	}),
	sm: ({variant}) => ({
		root: {
			p: '1rem 2rem',
			fontWeight: ! ['underline'].includes(variant) ? 500 : 400,
			fontSize: {
				base: '1.6rem',
				md: '1.8rem'
			}
		},
		subtext: {
			fontSize: '89%'
		},
	}),
	md: ({variant}) => ({
		root: {
			p: '1.6rem 2.4rem',
			fontWeight: ! ['underline'].includes(variant) ? 500 : 400,
			fontSize: {
				base: '1.6rem',
				md: '1.9rem'
			}
		},
		subtext: {
			fontSize: '89.5%'
		},
	}),
	lg: ({variant}) => ({
		root: {
			p: '1.8rem 2.6rem',
			fontWeight: ! ['underline'].includes(variant) ? 700 : 400,
			fontSize: {
				base: '1.8rem',
				md: '2.2rem'
			}
		},
		subtext: {
			fontSize: '77%'
		},
	}),
	menu: () => ({
		root: {
			px: {
				base: '1rem',
				md: 'mobile.spacing.content.x',
				lg: 'desktop.spacing.content.x'
			},
			py: {
				lg: '0.8rem'
			},
			fontWeight: 400,
			width: 'unset',
			minWidth: 'unset',
			fontSize: {
				base: '1.2rem',
				md: '1.4rem',
				lg: '1.8rem',
			}
		},
		text: {
			whiteSpace: 'nowrap',
			wordBreak: 'break-word',  
			textAlign: {
				base: 'center',
				lg: 'unset'
			}
		}
	}),
}

export const styles: ComponentStyleConfig = {
	baseStyle: (props) => ({
		root: {
			lineHeight: 'unset',
			height: 'unset',
			textDecoration: 'none',
			width: 'fit-content',

			borderRadius: 'xs',

			_hover: {
				textDecoration: 'none',
			},
		},
		wrapper: {
			flexDirection: 'column',
			// @ts-ignore
			alignItems: {
				left: 'flex-start',
				center: 'center',
				right: 'flex-end',
			}[props?.alignment ?? 'left'],
			gap: '0.25rem'
		},
		text: {
			lineHeight: 1.2,
			fontWeight: 'inherit',
			textWrap: 'wrap',
			textAlign: props?.alignment
		},
		subtext: {
			lineHeight: 1.2,
			fontWeight: 'inherit',
			textWrap: 'wrap',
			textAlign: props?.alignment
		},
		icon: {}
	}),
	sizes,
	variants,
	defaultProps: {
		size: 'md',
		variant: 'solid',
		colorScheme: 'primary',
		alignment: 'left'
	},
};

export interface ButtonProps extends Omit<ChakraButtonProps, 'leftIcon' | 'rightIcon'> {
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
	subtext?: string;
	icon?: IconProps['id'],
	alignment?: 'left' | 'center' | 'right'; // TODO: enum
	withArrow?: boolean;
	href?: string
}

// TODO: Separate Link component as Button wrapper (with addition of href prop?)
const Button = forwardRef<ButtonProps, 'button'>(({ children, ...props }, ref) => {
	const styles = useMultiStyleConfig('Components/Button', props)
	const { subtext, icon, alignment, withArrow, href, sx, ...rest } = omitThemingProps(props)

	const { styles: styleProps, ...componentProps } = extractStyledProps(rest);

	return (
		<ChakraButton ref={ref}
			as={href && !props?.isDisabled ? RouterLink : undefined}
			to={href}
			sx={{...styles.root, ...styleProps, ...sx}}
			disabled={props?.isDisabled}
			leftIcon={icon ? <Icon id={icon} size="1.6rem" /> : undefined} // TODO: Custom handling
			// @ts-ignore
			rightIcon={withArrow ? <Icon id="general.chevron_right" size="1.6rem" /> : undefined} // TODO: Custom handling
			iconSpacing="1rem" // TODO: Custom handling, replace with iconset system component
			{...componentProps}
		>
			<Flex sx={styles.wrapper}>
				{children && <chakra.span __css={styles.text}>{children}</chakra.span>}
				{subtext && <chakra.small __css={styles.subtext}>{subtext}</chakra.small>}
			</Flex>
		</ChakraButton>
	)
})

Button.displayName = 'Button';

export default Button;