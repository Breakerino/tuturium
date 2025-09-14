//
import { Flex, Grid, Heading, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams } from 'react-router-dom';

//
import { queryClient } from '@/App';
import { useApi } from '@/app/api';
import { formatAmount, formatIBAN } from '@/app/functions';
import { Wallet } from '@/app/types';
import Button from '@/components/Button';
import TransactionItem from '@/components/TransactionItem';
import CreateTransactionDrawer from '@/containers/CreateTransactionDrawer';
import SpendingReport from '@/containers/SpendingReport';
import { AxiosError } from 'axios';
import { has, isArray, isEmpty } from 'lodash';
import moment from 'moment';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const WalletScreen: React.FC = () => {
	const api = useApi();
	const params = useParams();

	const walletQuery = useQuery<Record<string, any>>({
		queryKey: ['wallet', params.uid],
		queryFn: async () => {
			try {
				const { status, data: { data } } = await api.getWallet({
					urlParams: {
						uid: params?.uid ?? ''
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

	const [isSyncing, setIsSyncing] = React.useState(false);
	const createTransactionDrawer = useDisclosure();

	const wallet = walletQuery.data as Wallet & { transactions: Record<string, any>[] };

	const transactions = React.useMemo(() => {
		const parsedTransactions: Record<string, any> = {};

		if (!isArray(wallet?.transactions)) {
			return parsedTransactions;
		}

		for (const transaction of wallet?.transactions) {
			if (!has(parsedTransactions, transaction.valueDate)) {
				parsedTransactions[transaction.valueDate] = { income: 0, expense: 0, transactions: [] };
			}

			// @ts-ignore
			parsedTransactions[transaction.valueDate].transactions.push(transaction);
			// @ts-ignore
			parsedTransactions[transaction.valueDate][transaction.amount >= 0 ? 'income' : 'expense'] += transaction.amount;
		}

		return parsedTransactions;
	}, [wallet?.transactions]);

	// TODO: Convert to mutation
	const handleWalletSync = async () => {
		setIsSyncing(true);

		await api.syncWallet({
			urlParams: {
				uid: wallet?.uid
			}
		});

		setIsSyncing(false);

		queryClient.invalidateQueries({
			queryKey: ['wallet', wallet?.uid]
		});

		queryClient.invalidateQueries({
			queryKey: ['spending-report']
		});
	}

	if (walletQuery.isLoading || isEmpty(wallet)) {
		return (
			<Grid placeItems="center" w="full" h="full" color="purple.200">
				<Spinner size="xl" />
			</Grid>
		)
	}

	return (<>
		{wallet.type === 'cash' &&
			<CreateTransactionDrawer
				wallet={wallet}
				onClose={createTransactionDrawer.onClose}
				isOpen={createTransactionDrawer.isOpen}
			/>
		}

		<Flex flexDirection="column" w="full">
			<Flex>
				<Text as="small" fontSize="1.4rem" color="purple.300">{`Wallets > ${wallet.name}`}</Text>
			</Flex>

			<Flex alignItems="flex-start" justifyContent="space-between" gap="2rem" mt="1rem">
				<Flex flexDirection="column">
					<Heading as="h1" fontSize="3.2rem" color="purple.200" lineHeight={1} fontWeight={500} m={0}>{wallet.name} wallet</Heading>
					{wallet.iban && <Text as="small" fontSize="1.4rem" color="purple.600">{formatIBAN(wallet.iban)}</Text>}
					<Text fontSize="2.2rem" color="purple.200" mt="0.5rem">{formatAmount(wallet.balance, wallet.currency)}</Text>
				</Flex>
				<Flex alignItems="center" gap="2rem">
					{wallet.type === 'bank' && <Button variant="circle-icon" icon="general.sync" onClick={handleWalletSync} isLoading={isSyncing} />}
				</Flex>
			</Flex>

			<SpendingReport
				mt="2.4rem"
				background="purple.900" color="purple.200"
				borderWidth="0.1rem" borderColor="purple.800" borderStyle="solid" borderRadius="sm"
				overflowX="unset"
				overflowY="unset"
				wallet={wallet.uid}
			/>

			<Flex gap="1rem" alignItems="center" justifyContent="space-between" mt="2rem">
				<Heading as="h2" fontSize="2.4rem" color="purple.200" lineHeight={1} fontWeight={500} mt="3.2rem">Transactions</Heading>
				{wallet.type === 'cash' && <Button size="xs" icon="general.plus" onClick={createTransactionDrawer.onOpen}>Add</Button>}
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
								<Text color="#B8DD55">+{formatAmount(income, wallet.currency)}</Text>
								<Text>/</Text>
								<Text color="#D7775B">{formatAmount(expense, wallet.currency)}</Text>
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

export default WalletScreen