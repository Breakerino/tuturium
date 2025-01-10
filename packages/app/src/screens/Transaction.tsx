//
import { Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

//
import { useApi } from '@/app/api';
import { formatAmount, formatTransactionName } from '@/app/functions';
import Button from '@/components/Button';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { isNil } from 'lodash';
import moment from 'moment';


const Transaction: React.FC = () => {
	const api = useApi();
	const params = useParams();
	const navigate = useNavigate();

	const transactionQuery = useQuery<Record<string, any>>({
		queryKey: ['transaction', params.id],
		queryFn: async () => {
			try {
				const { status, data: { data } } = await api.getTransaction({
					urlParams: {
						id: params.id ?? ''
					}
				});

				if (status !== 200) {
					return [];
				}

				return data;
			} catch (e) {
				if (e instanceof AxiosError && e.response?.status === 401) { }
				console.error(e);
			}
			return []
		},
		staleTime: 30000
	})

	if (transactionQuery.isLoading || isNil(transactionQuery.data)) {
		return <Spinner size="xl" colorScheme='purple' />
	}

	return (
		<Flex flexDirection="column" w="full">
			<Flex>
				<Text as="small" fontSize="1.4rem" color="purple.300">{`Wallets > ${transactionQuery?.data.wallet.name}`}</Text>
			</Flex>
			<Flex justifyContent={{md: 'space-between'}} alignItems={{base: 'flex-start', md: 'center'}} flexDirection={{base: 'column', md: 'row'}} gap="1rem" mt="1rem">
				<Flex flexDirection="column">
					<Heading as="h1" fontSize={{base: '2.4rem', md: '3.2rem'}} color="purple.200" fontWeight={500} m={0}>{formatTransactionName(transactionQuery?.data)}</Heading>
					{transactionQuery?.data?.category?.name && <Heading as="h2" fontSize={{base: '1.6rem', md: '1.8rem'}} color="purple.200" fontWeight={400} m={0}>{transactionQuery?.data?.category?.name}</Heading>}
				</Flex>
				<Flex flexDirection="column">
					<Flex gap="1rem" alignItems="center">
						<Text as="span" textAlign={{md: 'right'}} fontSize="2rem" fontWeight={600} color={transactionQuery?.data.amount >= 0 ? '#B8DD55' : '#D7775B'}>{transactionQuery?.data.amount >= 0 ? '+' : ''}{formatAmount(transactionQuery?.data?.amount, transactionQuery?.data?.currency)}</Text>
						{transactionQuery?.data?.receipt && (
							<Button variant="circle-icon" icon="general.chevron-right" color="purple.100" fontSize="1.6rem" onClick={() => navigate(`/receipts/${transactionQuery?.data?.receipt}`)}
								w={{ base: '2.4rem', md: '2.6rem' }} h={{ base: '2.4rem', md: '2.6rem' }} minW={{ base: '2.4rem', md: '2.6rem' }} minH={{ base: '2.4rem', md: '2.6rem' }}  maxW={{ base: '2.4rem', md: '2.6rem' }} maxH={{ base: '2.4rem', md: '2.6rem' }} 
							/>
						)}
					</Flex>
					<Text as="span" textAlign={{md: 'right'}} fontSize="1.6rem" color="purple.200" fontWeight={500} m={0}>{moment(transactionQuery?.data?.postingDate).format('DD MMM YY')}</Text>
				</Flex>
			</Flex>
		</Flex>
	)
}

export default Transaction;