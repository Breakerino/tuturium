//
import { Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

//
import { useApi } from '@/app/api';
import { formatAmount } from '@/app/functions';
import { AxiosError } from 'axios';
import { has, isArray, isEmpty, isNil, set } from 'lodash';
import moment from 'moment';
import ReceiptItem from '@/components/ReceiptItem';
import ProductItem from '@/components/ProductItem';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const ProductCategory: React.FC = () => {
	const api = useApi();
	const params = useParams();
	const [queryParams] = useSearchParams();

	const productCategoryQuery = useQuery<Record<string, any>>({
		queryKey: ['product-category', params.uid, queryParams.get('from'), queryParams.get('to'), queryParams.get('wallet')],
		queryFn: async () => {
			try {
				const { status, data: { data } } = await api.getSpendingReportProductCategory({
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

	const receipts = React.useMemo(() => {
		const parsedReceipts = {};

		if (isEmpty(productCategoryQuery.data)) {
			return parsedReceipts;
		}

		for (const receipt of productCategoryQuery.data.receipts) {
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
	}, [productCategoryQuery.data]);

	const products = React.useMemo(() => {
		if (!isArray(productCategoryQuery.data?.products)) {
			return [];
		}

		return productCategoryQuery.data?.products;
	}, [productCategoryQuery.data]);


	if (productCategoryQuery.isLoading) {
		return <Spinner size="xl" colorScheme='purple' />
	}

	const { category, total } = productCategoryQuery?.data as Record<string, any>;

	return (<>
		<Flex flexDirection="column" w="full">
			<Flex>
				<Text as="small" fontSize="1.4rem" color="purple.300">{`Products > Categories > ${category.name}`}</Text>
			</Flex>

			<Flex alignItems="flex-start" justifyContent="space-between" gap="2rem" mt="1rem">
				<Flex flexDirection="column">
					<Heading as="h1" fontSize="3.2rem" color="purple.200" lineHeight={1} fontWeight={500} m={0}>{category.name}</Heading>
					<Text fontSize="2.2rem" color="purple.200" mt="0.5rem">{formatAmount(total.price, 'EUR')}</Text>
				</Flex>
				<Flex flexDirection="column">
					{queryParams.has('from') && queryParams.has('to') && <Text fontSize="1.8rem" color="purple.200" textAlign="right">{moment(queryParams.get('from')).format('DD MMM YY')} - {moment(queryParams.get('to')).format('DD MMM YY')}</Text>}
				</Flex>
			</Flex>

			<Flex flexDirection="column" mt="4rem">
				<Flex flexDirection="column" color="purple.200">
					<Heading as="h2" fontSize="2.6rem" color="purple.200" fontWeight={500}>Products ({total.quantity})</Heading>

					<Flex direction="column" gap="1.5rem" mt="2rem">
						{products.map((product) => (
							<ProductItem {...product} />
						))}
					</Flex>
				</Flex>
			</Flex>

			<Flex flexDirection="column" mt="4rem">
				<Flex flexDirection="column">
					<Heading as="h2" fontSize="2.6rem" color="purple.200" fontWeight={500}>Receipts ({productCategoryQuery.data?.receipts?.length})</Heading>

					{Object.entries(receipts)?.map(([date, { receipts, total }]: any) => (
						<Flex direction="column" mt="2rem" background="purple.900" color="purple.200">
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
		</Flex>
	</>)
}

export default ProductCategory