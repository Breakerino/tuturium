//
import { formatAmount, formatTransactionName } from '@/app/functions';
import { extractStyledProps } from '@/modules/wooptima/chakra-extended';
import { Flex, Grid, Text } from '@chakra-ui/react';
import moment from 'moment';
import React from 'react';
import { useNavigate } from 'react-router';
import Button from './Button';
import { IconProps } from './Icon';

//

export interface TransactionItemProps extends Record<string, any> {
	icon?: IconProps['id'];
}

const TransactionItem: React.FC<TransactionItemProps> = ({ icon = 'general.chevron-right', ...props }) => {
	const {styles, ...item} = extractStyledProps(props)
	
	const navigate = useNavigate();
	
	return (
		<Grid alignItems="center" gap="1rem" gridTemplateColumns="auto minmax(12ch, 1fr)"
			sx={styles}
			onClick={() => navigate(`/transactions/${item.id}`)}
		>
			<Flex alignItems="center" gap="1.2rem">
				<Button variant="circle-icon" icon="general.chevron-right" color="purple.100" fontSize="1.6rem"
					w={{ base: '3.2rem', md: '3.6rem' }} h={{ base: '3.2rem', md: '3.6rem' }} minW={{ base: '3.2rem', md: '3.6rem' }} minH={{ base: '3.2rem', md: '3.6rem' }} maxW={{ base: '3.2rem', md: '3.6rem' }} maxH={{ base: '3.2rem', md: '3.6rem' }}
				/>

				<Flex flexDirection="column">
					<Text as="strong" fontSize={{ base: '1.5rem', md: '1.8rem' }}
						display="-webkit-box"
						overflow="hidden"
						textOverflow="ellipsis"
						noOfLines={1}
					>{formatTransactionName(item)}</Text>
					<Text as="span" fontSize={{ base: '1.2rem', md: '1.4rem' }}>{item?.category?.name}</Text>
					<Text as="small" fontSize={{ base: '1.2rem' }}>{moment(item?.valueDate).format('DD MMM YY')}</Text>
				</Flex>

			</Flex>

			<Text as="strong" width="fit-content" justifySelf="end" textAlign="right" whiteSpace="nowrap" fontSize={{ base: '1.5rem', md: '1.8rem' }} color={item.amount >= 0 ? '#B8DD55' : '#D7775B'}>{item.amount >= 0 ? '+' : ''}{formatAmount(item.amount, 'EUR')}</Text>
		</Grid>
	)
}

export default TransactionItem