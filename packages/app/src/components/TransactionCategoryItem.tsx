//
import { formatAmount } from '@/app/functions';
import { Flex, FlexProps, Text } from '@chakra-ui/react';
import React from 'react';
import Icon, { IconProps } from './Icon';

//

export interface TransactionCategoryItemProps extends FlexProps {
	icon?: IconProps['id'];
	name: string;
	total: number;
	currency?: string
	transactions?: number;
}

const TransactionCategoryItem: React.FC<TransactionCategoryItemProps> = ({ icon = 'general.chevron-right', name, total, currency = 'EUR', transactions, ...props }) => {
	return (
		<Flex alignItems="center" gap="1rem" justifyContent="space-between" {...props}>
			<Flex alignItems="center" gap="1.2rem">
				<Flex w={{ base: '3.2rem', md: '3.6rem' }} h={{ base: '3.2rem', md: '3.6rem' }} minW={{ base: '3.2rem', md: '3.6rem' }} minH={{ base: '3.2rem', md: '3.6rem' }} maxW={{ base: '3.2rem', md: '3.6rem' }} maxH={{ base: '3.2rem', md: '3.6rem' }} bg="purple.500" alignItems="center" justifyContent="center" borderRadius="50%">
					<Icon id={icon} color="purple.100" fontSize="1.6rem" />
				</Flex>
				<Flex flexDirection="column">
					<Text as="span" fontSize={{ base: '1.5rem', md: '1.8rem' }}>{name}</Text>
					<Text as="span" fontSize={{ base: '1.2rem', md: '1.4rem' }}>{transactions} transactions</Text>
				</Flex>
			</Flex>
			<Text as="strong" fontSize={{ base: '1.5rem', md: '1.8rem' }} color={total >= 0 ? '#B8DD55' : '#D7775B'}>{formatAmount(total, currency)}</Text>
		</Flex>
	)
}

export default TransactionCategoryItem