import { ChakraTheme } from '@chakra-ui/react';

const general: Partial<Omit<ChakraTheme, 'components'>> = {
	config: {
		cssVarPrefix: 'tuturium'
	},
	styles: {
		global: {
			html: {
				fontSize: '10px'
			},
			body: {
				background: '#0C0E1C',
				overflow: 'hidden'
			},
			'*:focus:not(:focus-visible)': {
				outline: 'none',
				boxShadow: 'none'
			}
		}
	},
	fonts: {
		heading: `'Overpass', sans-serif`,
		body: `'Overpass', sans-serif`,
	},
	radii: {
		xs: '0.5rem',
    sm: '1rem',
    base: '1.5rem',
    md: '2rem',
    lg: '2.5rem',
    xl: '3rem',
    circle: '50%',
	},
	semanticTokens: {
		space: {
			'mobile.spacing.content.x': '1.8rem',
			'desktop.spacing.content.x': '3.2rem',
			'spacing.content.y': '2.4rem',
			'spacing.header.y': '1.6rem'
		},
		colors: {
			/**
			 * Primary
			 */
			primary: 'purple.500',
			'primary.500': 'purple.500',
			'primary.light': 'purple.100',
			'primary.medium': 'purple.600',
			'primary.dark': 'purple.800',
			'primary.light.ultra': 'purple.50',
			'primary.dark.ultra': 'purple.950',
			'primary.hover': 'purple.700',
			'primary.text': 'purple.100',

			/**
			 * Secondary
			 */
			secondary: 'secondary.DEFAULT',
			'secondary.500': 'secondary.DEFAULT',
			'secondary.light': 'secondary.light.DEFAULT',
			'secondary.medium': 'secondary.medium.DEFAULT',
			'secondary.dark': 'secondary.dark.DEFAULT',
			'secondary.light.ultra': 'secondary.light.ultra.DEFAULT',
			'secondary.dark.ultra': 'secondary.dark.ultra.DEFAULT',

			/**
			 * Accent
			 */
			accent: 'accent.DEFAULT',
			'accent.light': 'accent.light.DEFAULT',
			'accent.medium': 'accent.medium.DEFAULT',
			'accent.dark': 'accent.dark.DEFAULT',
			'accent.light.ultra': 'accent.light.ultra.DEFAULT',
			'accent.dark.ultra': 'accent.dark.ultra.DEFAULT',

			/**
			 * Action
			 */
			action: 'action.DEFAULT',
			'action.light': 'action.light.DEFAULT',
			'action.medium': 'action.medium.DEFAULT',
			'action.dark': 'action.dark.DEFAULT',
			'action.light.ultra': 'action.light.ultra.DEFAULT',
			'action.dark.ultra': 'action.dark.ultra.DEFAULT',

			/**
			 * Base
			 */
			base: 'base.DEFAULT',
			'base.light': 'base.light.DEFAULT',
			'base.medium': 'base.medium.DEFAULT',
			'base.dark': 'base.dark.DEFAULT',
			'base.light.ultra': 'base.light.ultra.DEFAULT',
			'base.dark.ultra': 'base.dark.ultra.DEFAULT',

			/**
			 * neutral
			 */
			neutral: 'neutral.DEFAULT',
			'neutral.light': 'neutral.light.DEFAULT',
			'neutral.medium': 'neutral.medium.DEFAULT',
			'neutral.dark': 'neutral.dark.DEFAULT',
			'neutral.light.ultra': 'neutral.light.ultra.DEFAULT',
			'neutral.dark.ultra': 'neutral.dark.ultra.DEFAULT',

			/**
			 * Black
			 */
			black: 'black.DEFAULT',

			/**
			 * White
			 */
			white: 'white.DEFAULT',
		},
	},
};

export default general;
