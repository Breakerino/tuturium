//
import { Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';

//

//

export interface ContentProps extends FlexProps {
}

const Content: React.FC<ContentProps> = ({ children, ...props }) => {
	return (
		<Flex {...props}
			sx={{
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
			}}
			px={{
				base: "mobile.spacing.content.x",
				lg: "desktop.spacing.content.x"
			}}
			py="spacing.content.y"
		>
			{children}
		</Flex>
	)
}

export default Content