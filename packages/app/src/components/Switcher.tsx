//
import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';

//

export interface SwitcherProps extends Omit<FlexProps, 'onSelect'> {
	selected: string
	onSelect: (type: string) => void
	data: {
		id: string,
		label: string,
		value: string,
		color: string
	}[]
}

const Switcher: React.FC<SwitcherProps> = ({ data, selected, onSelect: handleSelect, ...props }) => {
	return (
		<Flex {...props}>
			{data.map(({ id, value, label, color }, index) => (
				<Flex key={`switcher-button_${id}`} flexDirection="column" alignItems="center"
					px={{base: '2.2rem', md: '3.2rem'}} py={{base: '1.2rem', md: '1.6rem'}}
					borderWidth="0.1rem" borderColor="purple.800" borderStyle="solid"
					borderRadius="sm"
					borderLeftRadius={index > 0 ? 'none' : undefined}
					borderRightRadius={index === 0 || index < (data.length - 1) ? 'none' : undefined}
					cursor="pointer"
					_hover={{ background: 'purple.700' }}
					background={selected === id ? 'purple.800' : undefined}
					onClick={(() => handleSelect(id))}
				>
					<Text fontSize={{base: '1.4rem', md: '1.6rem'}}>{label}</Text>
					<Text fontSize={{base: '1.6rem', md: '1.8rem'}} color={color}>{value}</Text>
				</Flex>
			))}
		</Flex>
	)
}

export default Switcher