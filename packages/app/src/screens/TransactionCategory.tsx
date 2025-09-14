//
import { Flex, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

//
import { useApi } from '@/app/api';
import { formatAmount } from '@/app/functions';
import TransactionItem from '@/components/TransactionItem';
import { AxiosError } from 'axios';
import { has, isArray, isNil } from 'lodash';
import moment from 'moment';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const TransactionCategory: React.FC = () => {
	const api = useApi();
	const params = useParams();
	const [queryParams] = useSearchParams();

	const transactionCategoryQuery = useQuery<Record<string, any>>({
		queryKey: ['transaction-category', params.uid, queryParams.get('from'), queryParams.get('to'), queryParams.get('wallet')],
		queryFn: async () => {
			try {
				const { status, data: { data } } = await api.getSpendingReportTransactionCategory({
					urlParams: {
						uid: params?.uid ?? ''
					},
					params: Object.fromEntries(
						Object.entries({
							from: queryParams.get('from'),
							to: queryParams.get('to'),
							wallet: queryParams.get('wallet'),
						}).filter(([, value]) => !isNil(value))
					)
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

	const transactions = React.useMemo(() => {
		const parsedTransactions: Record<string, any> = {};

		if (!isArray(transactionCategoryQuery?.data?.transactions)) {
			return parsedTransactions;
		}

		for (const transaction of transactionCategoryQuery?.data?.transactions) {
			if (!has(parsedTransactions, transaction.valueDate)) {
				parsedTransactions[transaction.valueDate] = { income: 0, expense: 0, transactions: [] };
			}

			// @ts-ignore
			parsedTransactions[transaction.valueDate].transactions.push(transaction);
			// @ts-ignore
			parsedTransactions[transaction.valueDate][transaction.amount >= 0 ? 'income' : 'expense'] += transaction.amount;
		}

		return parsedTransactions;
	}, [transactionCategoryQuery?.data?.transactions]);

	const total = transactionCategoryQuery?.data?.total;
	const category = transactionCategoryQuery?.data?.category;
	const wallet = transactionCategoryQuery?.data?.wallet;

	if (transactionCategoryQuery.isLoading) {
		return (
			<Grid placeItems="center" w="full" h="full" color="purple.200">
				<Spinner size="xl" />
			</Grid>
		)
	}

	return (<>
		<Flex flexDirection="column" w="full">
			<Flex>
				<Text as="small" fontSize="1.4rem" color="purple.300">{`Transactions > Categories > ${category.name}`}</Text>
			</Flex>

			<Flex alignItems="flex-start" justifyContent="space-between" gap="2rem" mt="1rem">
				<Flex flexDirection="column">
					<Heading as="h1" fontSize="3.2rem" color="purple.200" lineHeight={1} fontWeight={500} m={0}>{category.name}</Heading>
					<Text fontSize="2.2rem" color={total >= 0 ? '#B8DD55' : '#D7775B'} mt="0.5rem">{formatAmount(total, 'EUR')}</Text>
				</Flex>
				<Flex flexDirection="column">
					{wallet && <Text fontSize="2.2rem" color="purple.200" textAlign="right">{wallet.name}</Text>}
					{queryParams.has('from') && queryParams.has('to') && <Text fontSize="1.8rem" color="purple.200" textAlign="right">{moment(queryParams.get('from')).format('DD MMM YY')} - {moment(queryParams.get('to')).format('DD MMM YY')}</Text>}
				</Flex>
			</Flex>

			<Flex flexDirection="column"
				background="purple.900" color="purple.200"
				mt="2rem"
			>
				{Object.entries(transactions)?.map(([date, { transactions, income, expense }]: any) => (
					<Flex direction="column">
						<Flex
							bg="purple.800"
							w="full" p="1rem 1.6rem"
							position="sticky" top="-2.45rem" zIndex={1}
							fontSize="1.6rem" fontWeight={600}
							gap="1rem"
							justifyContent="space-between"
							alignItems="center"
							borderRadius="sm"
						>
							<Text>{moment(date).format('DD MMM YY')}</Text>
							<Flex gap="1rem" alignItems="center">
								<Text color="#B8DD55">+{formatAmount(income, 'EUR')}</Text>
								<Text>/</Text>
								<Text color="#D7775B">{formatAmount(expense, 'EUR')}</Text>
							</Flex>
						</Flex>
						<Flex direction="column" my="1rem" gap="1rem">
							{transactions.map((transaction: Record<string, any>) => (
								<TransactionItem {...transaction}
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
								/>))
							}
						</Flex>
					</Flex>
				))}
			</Flex>
		</Flex>
	</>)
}

export default TransactionCategory