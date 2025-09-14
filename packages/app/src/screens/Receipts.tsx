//
import { Flex, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import React from 'react';

//
import { useApi } from '@/app/api';
import { formatAmount } from '@/app/functions';
import ReceiptItem from '@/components/ReceiptItem';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { has, isArray, set } from 'lodash';
import moment from 'moment';

const Receipts: React.FC = () => {
	const api = useApi();

	const receiptsQuery = useQuery<Record<string, any>>({
		queryKey: ['receipts'],
		queryFn: async () => {
			try {
				const { status, data: { data } } = await api.getReceipts();

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

	const receipts = React.useMemo(() => {
		const parsedReceipts = {};

		if (!isArray(receiptsQuery.data)) {
			return parsedReceipts;
		}

		for (const receipt of receiptsQuery.data) {
			const receiptDate = moment(receipt.issuedAt).format('YYYY-MM-DD');

			if (!has(parsedReceipts, receiptDate)) {
				set(parsedReceipts, receiptDate, { total: 0, receipts: [] });
			}

			// @ts-ignore
			parsedReceipts[receiptDate].receipts.push(receipt);
			// @ts-ignore
			parsedReceipts[receiptDate].total += receipt.total;
		}

		return parsedReceipts;
	}, [receiptsQuery.data]);

	
	if (receiptsQuery.isLoading) {
		return (
			<Grid placeItems="center" w="full" h="full" color="purple.200">
				<Spinner size="xl" />
			</Grid>
		)
	}
	
	return (
		<Flex flexDirection="column" w="full">
			<Heading as="h1" fontSize="3.2rem" color="purple.200" fontWeight={500} m={0}>Receipts</Heading>

			<Flex flexDirection="column"
				background="purple.900" color="purple.200"
				mt="2rem"
			>
				{Object.entries(receipts)?.map(([date, { receipts, total }]: any) => (
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
							<Text color="purple.200">{moment(date).format('DD MMM YY')}</Text>
							<Flex gap="1rem" alignItems="center">
								<Text color="purple.200">{formatAmount(total, 'EUR')}</Text>
							</Flex>
						</Flex>
						<Flex gap="1rem" my="1rem" direction="column">
							{receipts.map((receipt: Record<string, any>) => (
								<ReceiptItem {...receipt} />
							))}
						</Flex>
					</Flex>
				))}
			</Flex>
		</Flex>
	)
}

export default Receipts;