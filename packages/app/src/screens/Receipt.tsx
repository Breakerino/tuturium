//
import { Flex, Grid, Heading, List, ListItem, Spinner, Text, useMediaQuery } from '@chakra-ui/react';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

//
import { useApi } from '@/app/api';
import { formatAmount } from '@/app/functions';
import { useQuery } from '@tanstack/react-query';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { AxiosError } from 'axios';
import { isEmpty, isInteger, isNil, isObject } from 'lodash';
import moment from 'moment';
import Button from '@/components/Button';

const Receipt: React.FC = () => {
	const api = useApi();
	const params = useParams();
	const navigate = useNavigate();

	const [isDesktop] = useMediaQuery('(min-width: 992px)');

	const receiptQuery = useQuery<Record<string, any>>({
		queryKey: ['receipt', params.uid],
		queryFn: async () => {
			try {
				const { status, data: { data } } = await api.getReceipt({
					urlParams: {
						uid: params.uid ?? ''
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

	const receiptBreakdownChartOptions = React.useMemo(() => {
		if (receiptQuery.isLoading || !isObject(receiptQuery.data)) {
			return null;
		}

		let breakdown = receiptQuery.data?.breakdown;

		if (isEmpty(breakdown)) {
			return null;
		}

		return {
			data: breakdown.map((category: Record<string, any>) => ({ ...category, total: Math.abs(category.total) })),
			background: { fill: "transparent" },
			legend: { enabled: false },
			series: [
				{
					type: 'donut',
					calloutLabelKey: 'name',
					angleKey: 'total',
					innerRadiusRatio: 0.5,
					sectorSpacing: 0,
					calloutLabel: { enabled: false },
					tooltip: {
						renderer: (params) => ({
							title: `${params.datum.name} (${Math.round((params.datum.total / receiptQuery.data?.total) * 100)}%)`,
							content: formatAmount(params.datum?.total ?? 0, 'EUR')
						})
					}
				},
			],
		} as AgChartOptions
	}, [receiptQuery.data]);

	if (receiptQuery.isLoading || isNil(receiptQuery.data)) {
		return <Spinner size="xl" colorScheme='purple' />
	}

	return (
		<Flex flexDirection="column" w="full">
			<Flex>
				<Text as="small" fontSize="1.4rem" color="purple.300">{`Receipts > ${receiptQuery?.data?.store.name}`}</Text>
			</Flex>
			
			<Flex justifyContent={{ md: 'space-between' }} alignItems={{ base: 'flex-start', md: 'center' }} flexDirection={{ base: 'column', md: 'row' }} gap="1rem" mt="1rem">
				<Flex flexDirection="column">
					<Heading as="h1" fontSize={{ base: '2.4rem', md: '3.2rem' }} color="purple.200" fontWeight={500} m={0}>{receiptQuery?.data?.store.name}</Heading>
					<Heading as="h2" fontSize={{ base: '1.6rem', md: '1.8rem' }} color="purple.200" fontWeight={500} m={0}>{`${receiptQuery?.data?.store.streetAddress}, ${receiptQuery?.data?.store.city}`}</Heading>
				</Flex>
				<Flex flexDirection="column">
					<Flex gap="1rem" alignItems="center">
						<Text as="span" textAlign={{ md: 'right' }} fontSize="2rem" color="purple.200" fontWeight={600}>{formatAmount(receiptQuery.data.total, receiptQuery.data.currency)}</Text>
						{receiptQuery?.data?.transaction && (
							<Button variant="circle-icon" icon="general.chevron-right" color="purple.100" fontSize="1.6rem" onClick={() => navigate(`/transactions/${receiptQuery?.data?.transaction}`)}
								w={{ base: '2.4rem', md: '2.6rem' }} h={{ base: '2.4rem', md: '2.6rem' }} minW={{ base: '2.4rem', md: '2.6rem' }} minH={{ base: '2.4rem', md: '2.6rem' }} maxW={{ base: '2.4rem', md: '2.6rem' }} maxH={{ base: '2.4rem', md: '2.6rem' }}
							/>
						)}
					</Flex>
					<Text as="span" textAlign={{ md: 'right' }} fontSize="1.6rem" color="purple.200" fontWeight={500} m={0}>{moment(receiptQuery?.data?.issuedAt).format('DD MMM YY HH:MM:SS')}</Text>
				</Flex>
			</Flex>

			<Grid gridTemplateColumns={{ base: '1fr', lg: '3fr 4fr' }} gap="3.6rem">
				{/* <ReceiptItems> */}
				<Flex mt="2.4rem" p="1.75rem" borderRadius="sm" flexDirection="column" color="purple.100" bg="purple.900"
					borderWidth="0.1rem" borderColor="purple.800" borderStyle="solid"
					overflowY="auto"
					maxHeight={{ lg: "75vh" }}
					height="100%"
					sx={{
						'&::-webkit-scrollbar': {
							width: '5px',
							borderRadius: 'xs',
							background: 'purple.700'
						},
						'&::-webkit-scrollbar-thumb': {
							background: 'purple.500',
							borderRadius: 'xs'
						}
					}}
				>
					<Text fontSize="2rem" color="purple.300" fontWeight={500}>Items</Text>

					<List as={Flex} flexDirection="column" w="full" gap="1rem" mt="1rem">
						{receiptQuery.data.items.map((item: Record<string, any>) => (
							<ListItem as={Flex} justifyContent="space-between" gap="1rem">
								<Flex flexDirection="column">
									<Text as="strong" fontSize={{ base: '1.6rem' }} fontWeight={600}
										display="-webkit-box"
										overflow="hidden"
										textOverflow="ellipsis"
										noOfLines={1}
									>{item?.product?.name ?? item.name}</Text>
									{item?.product?.categories && <Text fontSize="1.4rem">{item.product.categories.join(' / ')}</Text>}
									<Text fontSize="1.4rem">{item.quantity} {isInteger(item.quantity) ? 'ks' : 'kg'}</Text>
								</Flex>
								<Text fontSize="1.6rem" minW="12ch" textAlign="right">{formatAmount(item.price, receiptQuery.data?.currency)}</Text>
							</ListItem>
						))}
					</List>
				</Flex>
				{/* </ReceiptItems> */}

				{/* <ReceiptBreakdown> */}
				<Flex flexDirection="column" alignItems="center" justifyContent="flex-start">

					{/* <ReceiptBreakdownGraph> */}
					{receiptQuery.isLoading || receiptQuery.isFetching ? (
						<Grid minHeight={{ base: '28rem', md: '40rem' }} placeItems="center">
							<Spinner size="xl" />
						</Grid>
					) : (
						receiptBreakdownChartOptions ? (
							<AgCharts
								style={{
									width: !isDesktop ? '32rem' : '35rem',
									height: !isDesktop ? '32rem' : '35rem'
								}}
								options={receiptBreakdownChartOptions}
							/>
						) : (
							<Grid minHeight={{ base: '28rem', md: '40rem' }} placeItems="center">
								<Text fontSize="2.4rem">No data</Text>
							</Grid>
						)
					)}
					{/* </ReceiptBreakdownGraph> */}

					{/* <ReceiptBreakdownItems> */}
					<Flex mt="2.4rem" p="1.75rem" borderRadius="sm" flexDirection="column" color="purple.100" bg="purple.900"
						borderWidth="0.1rem" borderColor="purple.800" borderStyle="solid" width="full"
						mb="2rem"
					>
						<Text fontSize="2rem" color="purple.300" fontWeight={500}>Categories</Text>

						<List as={Flex} flexDirection="column" w="full" gap="1rem" mt="1rem">
							{receiptQuery.data.breakdown.map((item: Record<string, any>) => (
								<ListItem as={Flex} justifyContent="space-between">
									<Flex flexDirection="column">
										<Text as="strong" fontSize={{ base: '1.6rem' }} fontWeight={600}
											display="-webkit-box"
											overflow="hidden"
											textOverflow="ellipsis"
											noOfLines={1}
										>{item.name}</Text>
									</Flex>
									<Text fontSize="1.6rem" minW="12ch" textAlign="right">{formatAmount(item.total, receiptQuery.data?.currency)}</Text>
								</ListItem>
							))}
						</List>
					</Flex>
					{/* </ReceiptBreakdownItems> */}

				</Flex>
				{/* </ReceiptBreakdown> */}

			</Grid>
		</Flex>
	)
}

export default Receipt;