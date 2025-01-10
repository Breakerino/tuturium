//
import { formatAmount } from '@/app/functions';
import { extractStyledProps } from '@/modules/wooptima/chakra-extended';
import { Flex, Grid, Text } from '@chakra-ui/react';
import React from 'react';

//

export interface TransactionItemProps extends Record<string, any> {
}

const ProductItem: React.FC<TransactionItemProps> = ({ icon = 'general.chevron-right', ...props }) => {
	const {styles, ...item} = extractStyledProps(props)
	
	return (
		<Grid alignItems="center" gap="1rem" gridTemplateColumns="auto minmax(12ch, 1fr)"
			sx={styles}
		>
			<Flex alignItems="center" gap="1.2rem">
				<Flex flexDirection="column">
					<Text as="strong" fontSize={{ base: '1.5rem', md: '1.8rem' }}
						display="-webkit-box"
						overflow="hidden"
						textOverflow="ellipsis"
						noOfLines={1}
					>{item.name}</Text>
					<Text as="span" fontSize={{ base: '1.2rem', md: '1.4rem' }}>{item?.quantity} x</Text>
				</Flex>

			</Flex>

			<Text as="strong" width="fit-content" justifySelf="end" textAlign="right" whiteSpace="nowrap" fontSize={{ base: '1.5rem', md: '1.8rem' }} color="purple.200">{formatAmount(item.total, 'EUR')}</Text>
		</Grid>
	)
}

export default ProductItem