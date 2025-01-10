import colors from '@/app/theme/colors';
import { chakra, ComponentSingleStyleConfig, forwardRef, HTMLChakraProps, omitThemingProps, useStyleConfig } from '@chakra-ui/react';
import { has, isEmpty } from 'lodash';

const sizes: ComponentSingleStyleConfig['sizes'] = {
	none: {
		px: 0,
		py: 0
	},
	sm: {
		px: {
			base: '1.4rem',
			md: '2rem',
			cq: {
				base: '1.4rem',
				768: '2rem',
			}
		},
		py: {
			base: '1.6rem',
			md: '2.4rem',
			cq: {
				base: '1.6rem',
				768: '2.4rem'
			}
		}
	},
	md: {
		px: {
			base: '1.4rem',
			md: '6rem',
			cq: {
				base: '1.4rem',
				768: '6rem',
 			}
		},
		py: {
			base: '2rem', 
			md: '4rem',
			cq: {
				base: '2rem',
				768: '4rem'
			}
		}
	},
	lg: {
		px: {
			base: '1.4rem',
			md: '9rem',
			cq: {
				base: '1.4rem',
				768: '9rem',
			}
		},
		py: {
			base: '3rem',
			md: '4.8rem',
			cq: {
				base: '3rem',
				768: '4.8rem'
			}
		}
	},
};

const variants: ComponentSingleStyleConfig['variants'] = {
	filled: (props) => ({
		'--background': !isEmpty(props?.colorIntensity) && has(colors, `${props.colorScheme}.${props?.colorIntensity}`) ? `colors.${props.colorScheme}.${props?.colorIntensity}` : `colors.${props.colorScheme}`,
	}),
	outlined: (props) => ({
		borderColor: !isEmpty(props?.colorIntensity) && has(colors, `${props.colorScheme}.${props?.colorIntensity}`) ? `colors.${props.colorScheme}.${props?.colorIntensity}` : `colors.${props.colorScheme}`,
		borderWidth: `0.3rem`,
		borderStyle: `solid`,
		'--background': 'transparent',
	}),
	ghost: () => ({
		borderColor: `transparent`,
		'--background': 'transparent',
	})
};

export const styles: ComponentSingleStyleConfig = {
	baseStyle: () => ({
		bg: 'var(--background)',
		rounded: {
			base: 'frame.mobile',
			md: 'frame.desktop',
			cq: {
				base: 'frame.mobile',
				768: 'frame.desktop'
			}
		},
	}),
	variants,
	sizes,
	defaultProps: {
		size: 'md',
		variant: 'filled',
		colorScheme: 'neutral',
		colorIntensity: 'light.ultra',
	},
};

export interface FrameProps extends HTMLChakraProps<"div"> {
	variant?: keyof typeof variants;
	size?: keyof typeof sizes;
	//colorScheme?: keyof typeof colors;
	colorIntensity?: string;
}

const Frame = forwardRef<FrameProps, "div">(({ children, ...props }, ref) => {
	const styles = useStyleConfig('Components/Frame', props)
	const { ...rest } = omitThemingProps(props)

	return (
		<chakra.div ref={ref} __css={styles} {...rest}>
			{children}
		</chakra.div>
	)
})

Frame.displayName = 'Frame';

export default Frame;