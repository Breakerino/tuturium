//
import { formatAmount } from '@/app/functions';
import { Flex, Grid, Text } from '@chakra-ui/react';
import React from 'react';
import Button from './Button';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

//

export interface ReceiptItemProps extends Record<string, any> {

}

const ReceiptItem: React.FC<ReceiptItemProps> = ({ ...item }) => {
	const navigate = useNavigate();
	
	return (
		<Grid alignItems="center" gap="1rem" gridTemplateColumns="auto minmax(12ch, 1fr)"
			p="1.6rem 2.4rem"
			borderRadius="sm"
			cursor="pointer"
			_hover={{
				bg: 'purple.800'
			}}
			_active={{
				bg: 'purple.800',
				boxShadow: 'inset 0 0 0 0.1rem var(--tuturium-colors-purple-700)'
			}}
			onClick={() => navigate(`/receipts/${item.okp}`)}
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
					>{item.store.name}</Text>
					<Text fontSize="1.4rem">{moment(item.issuedAt).format('HH:MM')}</Text>
				</Flex>
			</Flex>
			<Text as="strong" width="fit-content" justifySelf="end" textAlign="right" whiteSpace="nowrap" fontSize={{ base: '1.5rem', md: '1.8rem' }} color="purple.200">{formatAmount(item.total, 'EUR')}</Text>
		</Grid>
	)
}

export default ReceiptItem