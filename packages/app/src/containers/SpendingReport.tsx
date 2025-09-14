//
import { Box, Flex, Grid, GridProps, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text, useMediaQuery } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { AgChartOptions } from 'ag-charts-community';
import { AgCharts } from 'ag-charts-react';
import { AxiosError } from 'axios';
import { isEmpty, isNull, isObject } from 'lodash';
import React from 'react';
import moment from 'moment';

//
import { useApi } from '@/app/api';
import { formatAmount } from '@/app/functions';
import Button from '@/components/Button';
import Switcher from '@/components/Switcher';
import TransactionCategoryItem from '@/components/TransactionCategoryItem';
import TransactionItem from '@/components/TransactionItem';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCategoryItem from '@/components/ProductCategoryItem';

export interface SpendingReportProps extends GridProps {
	wallet?: string;
}

const SpendingReport: React.FC<SpendingReportProps> = ({ wallet, ...props }) => {
	const api = useApi();
	const navigate = useNavigate();
	const [queryParams, setQueryParams] = useSearchParams();

	const [spendingDate, setSpendingDate] = React.useState<string | null>(queryParams.has('date') ? queryParams.get('date') ?? null : null);
	const [spendingWeek, setSpendingWeek] = React.useState<number | null>(queryParams.has('week') ? Number(queryParams.get('week')) : null);
	const [spendingType, setSpendingType] = React.useState<string>(queryParams.has('type') ? queryParams.get('type') ?? 'expense' : 'expense');
	const [spendingTab, setSpendingTab] = React.useState<number>(queryParams.has('tab') ? Number(queryParams.get('tab')) ?? 0 : 0);

	const [isTablet] = useMediaQuery('(min-width: 768px)');

	React.useEffect(() => {
		// @ts-ignore
		setQueryParams({
			...(spendingDate ? { date: spendingDate } : {}),
			...(spendingWeek ? { week: spendingWeek } : {}),
			...(spendingType ? { type: spendingType } : {}),
			...(spendingTab ? { tab: spendingTab } : {}),
		})
	}, [spendingDate, spendingWeek, spendingType, spendingTab])
	
	const spendingReportQuery = useQuery<Record<string, any>>({
		queryKey: ['spending-report', spendingDate, spendingWeek, wallet],
		queryFn: async () => {
			try {
				const params: Record<string, any> = {
					from: null,
					to: null,
					...(wallet ? { wallet } : {})
				}

				if (spendingDate && spendingDate !== 'Invalid date') {
					const monthStart = moment(spendingDate, 'MM-YYYY').startOf('month');
					const monthEnd = moment(spendingDate, 'MM-YYYY').endOf('month');

					const dateFrom = spendingWeek
						? moment(spendingDate, 'MM-YYYY').startOf('month').add(spendingWeek - 1, 'weeks').startOf('week').isBefore(monthStart)
							? monthStart
							: moment(spendingDate, 'MM-YYYY').startOf('month').add(spendingWeek - 1, 'weeks').startOf('week')
						: monthStart;

					const dateTo = spendingWeek
						? moment(spendingDate, 'MM-YYYY').startOf('month').add(spendingWeek - 1, 'weeks').endOf('week')
						: monthEnd;

					params.from = dateFrom.format('YYYY-MM-DD');
					params.to = dateTo.format('YYYY-MM-DD');
				}

				const { status, data: { data } } = await api.getSpendingReport({ params });

				if (status !== 200) {
					return [];
				}

				const newSpendingDate = moment(data.date.from).format('MM-YYYY');

				if (newSpendingDate !== spendingDate) {
					setSpendingDate(newSpendingDate);
				}

				return data;
			} catch (e) {
				if (e instanceof AxiosError && e.response?.status === 401) { }
				console.error(e);
			}

			return {}
		},
		staleTime: 30000
	})

	const spendingChartOptions = React.useMemo(() => {
		if (spendingReportQuery.isLoading || !isObject(spendingReportQuery.data)) {
			return null;
		}

		let categories = spendingReportQuery.data?.categories?.[spendingType];

		if (isEmpty(categories)) {
			return null;
		}

		return {
			data: categories.map((category: Record<string, any>) => ({ ...category, total: Math.abs(category.total) })),
			background: { fill: "transparent" },
			legend: { enabled: false },
			listeners: {
				seriesNodeDoubleClick: (e) => {
					navigateToTransactionCategory(e.datum)
				}
			},
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
							title: `${params.datum.name} (${Math.round((params.datum.total / spendingReportQuery.data?.totals[spendingType]) * 100)}%)`,
							content: formatAmount((params.datum?.total ?? 0) * (spendingType === 'income' ? 1 : -1), 'EUR')
						})
					},
				},
			],
		} as AgChartOptions
	}, [spendingReportQuery.data, spendingType]);
	
	const spendingMonth = React.useMemo(() => {
		return moment(spendingReportQuery?.data?.date.from).format('MM-YYYY');
	}, [spendingReportQuery?.data]);
	
	const transactionCategories = React.useMemo(() => {
		return spendingReportQuery?.data?.categories?.[spendingType] ?? [];
	}, [spendingReportQuery?.data, spendingType]);

	const productCategories = React.useMemo(() => {
		return spendingReportQuery?.data?.categories?.products ?? [];
	}, [spendingReportQuery?.data]);

	const transactions = React.useMemo(() => {
		return (spendingReportQuery?.data?.transactions ?? []).filter((transaction: Record<string, any>) => spendingType === 'income' && transaction.amount > 0 || spendingType === 'expense' && transaction.amount <= 0);
	}, [spendingReportQuery?.data, spendingType]);

	const updateSpendingDate = (action: 'prev' | 'next') => {
		updateSpendingWeek('reset');

		setSpendingDate((prevDate) => {
			const nextDate = moment(spendingMonth, 'MM-YYYY')[action === 'prev' ? 'subtract' : 'add'](1, 'month');

			if (nextDate.unix() > moment().unix()) {
				return prevDate;
			}

			return nextDate.format('MM-YYYY');
		})
	}

	const updateSpendingWeek = (action: 'prev' | 'next' | 'reset') => {
		setSpendingWeek((prevWeek) => {
			if (action === 'reset') {
				return null;
			}

			if (!prevWeek) {
				prevWeek = 0;
			}

			const nextWeek = action === 'prev' ? prevWeek - 1 : prevWeek + 1;

			if (nextWeek === 0) {
				return null;
			}

			return nextWeek >= 1 && nextWeek <= 4 ? nextWeek : prevWeek;
		})
	}

	const navigateToTransactionCategory = (category: Record<string, any>) => {
		const monthStart = moment(spendingMonth, 'MM-YYYY').startOf('month');
		const monthEnd = moment(spendingMonth, 'MM-YYYY').endOf('month');

		const dateFrom = spendingWeek
			? moment(spendingMonth, 'MM-YYYY').startOf('month').add(spendingWeek - 1, 'weeks').startOf('week').isBefore(monthStart)
				? monthStart
				: moment(spendingMonth, 'MM-YYYY').startOf('month').add(spendingWeek - 1, 'weeks').startOf('week')
			: monthStart;

		const dateTo = spendingWeek
			? moment(spendingMonth, 'MM-YYYY').startOf('month').add(spendingWeek - 1, 'weeks').endOf('week')
			: monthEnd;

		const url = new URL(`${window.location.origin}/transactions/category/${category.uid}`);

		url.searchParams.append('from', dateFrom.format('YYYY-MM-DD'))
		url.searchParams.append('to', dateTo.format('YYYY-MM-DD'))

		if (wallet) {
			url.searchParams.append('wallet', wallet);
		}

		navigate(url.pathname + url.search);
	}

	const navigateToProductCategory = (category: Record<string, any>) => {
		const monthStart = moment(spendingMonth, 'MM-YYYY').startOf('month');
		const monthEnd = moment(spendingMonth, 'MM-YYYY').endOf('month');

		const dateFrom = spendingWeek
			? moment(spendingMonth, 'MM-YYYY').startOf('month').add(spendingWeek - 1, 'weeks').startOf('week').isBefore(monthStart)
				? monthStart
				: moment(spendingMonth, 'MM-YYYY').startOf('month').add(spendingWeek - 1, 'weeks').startOf('week')
			: monthStart;

		const dateTo = spendingWeek
			? moment(spendingMonth, 'MM-YYYY').startOf('month').add(spendingWeek - 1, 'weeks').endOf('week')
			: monthEnd;

		const url = new URL(`${window.location.origin}/products/category/${category.id}`);

		url.searchParams.append('from', dateFrom.format('YYYY-MM-DD'))
		url.searchParams.append('to', dateTo.format('YYYY-MM-DD'))

		if (wallet) {
			url.searchParams.append('wallet', wallet);
		}

		navigate(url.pathname + url.search);
	}

	const handleTabsChange = (index: number) => {
		setSpendingTab(index);
	}

	return (
		<Grid
			gridTemplateColumns={{ xl: "1fr 1fr" }}
			overflowX="hidden"
			overflowY="hidden"
			{...props}
		>
			<Flex flexDirection="column" alignItems="center" justifyContent="center" p={{base: '2.4rem', md: '3.6rem'}} gap="2rem" maxW="calc(100vw - (2 * var(--tuturium-space-mobile-spacing-content-x)) - 0.5rem)">
				{spendingReportQuery.isLoading || spendingReportQuery.isFetching ? (
					<Flex gap="1rem" alignItems="center">
						<Button variant="circle-icon" icon="general.chevron-left" isDisabled />
						<Box minW="15.2rem" bg="purple.800" color="purple.200" fontSize="2rem" fontWeight={500} lineHeight={1} textAlign="center" px="3.2rem" py="1.25rem" borderRadius="lg">
							<Spinner size="sm" />
						</Box>
						<Button variant="circle-icon" icon="general.chevron-right" isDisabled />
					</Flex>
				) : (
					<Flex gap="1rem" alignItems="center">
						<Button variant="circle-icon" icon="general.chevron-left" onClick={() => updateSpendingDate('prev')} />
						<Text as="span" bg="purple.800" color="purple.200" fontSize="2rem" fontWeight={500} lineHeight={1} textAlign="center" px="3.2rem" py="1.25rem" borderRadius="lg">{moment(spendingMonth, 'MM-YYYY').format('MMM YYYY')}</Text>
						<Button variant="circle-icon" icon="general.chevron-right" onClick={() => updateSpendingDate('next')} isDisabled={spendingDate === moment().format('MM-YYYY')} />
					</Flex>
				)}

				<Flex gap="1rem" alignItems="center">
					<Button variant="circle-icon" icon="general.chevron-left" onClick={() => updateSpendingWeek('prev')} isDisabled={isNull(spendingWeek) || spendingWeek === 0 || (spendingReportQuery.isLoading || spendingReportQuery.isFetching)} />
					<Text as="span" bg="purple.800" color="purple.200" fontSize="1.6rem" fontWeight={500} lineHeight={1} textAlign="center" px="2.4rem" py="1rem" borderRadius="lg">Week {spendingWeek}</Text>
					<Button variant="circle-icon" icon="general.chevron-right" onClick={() => updateSpendingWeek('next')} isDisabled={spendingWeek === 4 || (spendingReportQuery.isLoading || spendingReportQuery.isFetching)} />
				</Flex>

				{spendingReportQuery.isLoading || spendingReportQuery.isFetching ? (
					<Grid minHeight={{ base: '28rem', md: '40rem' }} placeItems="center">
						<Spinner size="xl" />
					</Grid>
				) : (
					spendingChartOptions ? (
						<>
							<AgCharts
								style={{
									width: (!isTablet ? '28rem' : '40rem'),
									height: (!isTablet ? '28rem' : '40rem')
								}}
								options={spendingChartOptions}
							/>

							<Switcher
								data={[
									{ id: 'expense', label: 'Expense', value: formatAmount(spendingReportQuery?.data?.totals?.expense ?? 0, 'EUR'), color: '#D7775B' },
									{ id: 'income', label: 'Income', value: formatAmount(spendingReportQuery?.data?.totals?.income ?? 0, 'EUR'), color: '#B8DD55' }
								]}
								selected={spendingType}
								onSelect={(type) => setSpendingType(type)}
							/>
						</>
					) : (
						<Grid minHeight={{ base: '28rem', md: '40rem' }} placeItems="center">
							<Text fontSize="2.4rem">No data</Text>
						</Grid>
					)
				)}
			</Flex>

			<Flex flexDirection="column"
				borderLeftWidth={{ lg: "0.1rem" }} borderLeftColor="purple.800" borderLeftStyle="solid"
				maxW="calc(100vw - (2 * var(--tuturium-space-mobile-spacing-content-x)) - 0.5rem)"
			>
				<Tabs colorScheme="purple" variant="spending-overview" height="100%" isFitted defaultIndex={spendingTab} onChange={handleTabsChange}>
					<TabList overflowX="auto" position="sticky" top="-2.45rem" bg="purple.900" zIndex={1}>
						<Tab
							fontSize={{ base: '1.6rem', lg: '1.8rem' }}
							flex={{
								base: "1 0 50%",
								md: "1"
							}}
							whiteSpace="nowrap"
							px="1rem"
							py="1.4rem"
						>Categories ({transactionCategories.length})</Tab>
						<Tab
							fontSize={{ base: '1.6rem', lg: '1.8rem' }}
							flex={{
								base: "1 0 50%",
								md: "1"
							}}
							whiteSpace="nowrap"
							px="1rem"
							py="1.4rem"
						>Transactions ({transactions.length})</Tab>
						<Tab
							fontSize={{ base: '1.6rem', lg: '1.8rem' }}
							flex={{
								base: "1 0 50%",
								md: "1"
							}}
							whiteSpace="nowrap"
							px="1rem"
							py="1.4rem"
						>Products ({productCategories.length})</Tab>
					</TabList>
					<TabPanels height="100%" p={0} outline="none">
						<TabPanel height="100%" p={0} outline="none">
							<Flex flexDirection="column"
								p="1rem" gap="1rem"
								overflowY={{ lg: 'auto' }}
								maxHeight={{ lg: "65rem" }}
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
								{spendingReportQuery.isLoading || spendingReportQuery.isFetching ? (
									<Grid placeItems="center" height="100%">
										<Spinner size="xl" />
									</Grid>
								) : (
									isEmpty(transactionCategories) ? (
										<Grid placeItems="center" height="100%">
											<Text fontSize="2.4rem">No data</Text>
										</Grid>
									) : (
										transactionCategories?.map((item: { uid: string, name: string, total: number }) => (
											<TransactionCategoryItem {...item} onClick={() => navigateToTransactionCategory(item)}
												p="0.75rem 1.4rem"
												borderRadius="sm"
												cursor="pointer"
												_hover={{
													bg: 'purple.800',
												}}
												_active={{
													bg: 'purple.800',
													boxShadow: 'inset 0 0 0 0.1rem var(--tuturium-colors-purple-700)'
												}}
											/>
										))
									)
								)}
							</Flex>
						</TabPanel>
						<TabPanel height="100%" p={0} outline="none">
							<Flex flexDirection="column"
								p="1rem" gap="1rem"
								overflowY={{ lg: 'auto' }}
								maxHeight={{ lg: "65rem" }}
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
								{spendingReportQuery.isLoading || spendingReportQuery.isFetching ? (
									<Grid placeItems="center" height="100%">
										<Spinner size="xl" />
									</Grid>
								) : (
									isEmpty(transactions) ? (
										<Grid placeItems="center" height="100%">
											<Text fontSize="2.4rem">No data</Text>
										</Grid>
									) : (
										transactions?.map((item: Record<string, any>) => (
											<TransactionItem {...item}
												p="0.75rem 1.4rem"
												borderRadius="sm"
												cursor="pointer"
												_hover={{
													bg: 'purple.800'
												}}
												_active={{
													bg: 'purple.800',
													boxShadow: 'inset 0 0 0 0.1rem var(--tuturium-colors-purple-700)'
												}}
											/>
										))
									)
								)}
							</Flex>
						</TabPanel>
						<TabPanel height="100%" p={0} outline="none">
							<Flex flexDirection="column"
								p="1rem" gap="1rem"
								overflowY={{ lg: 'auto' }}
								maxHeight={{ lg: "65rem" }}
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
								{spendingReportQuery.isLoading || spendingReportQuery.isFetching ? (
									<Grid placeItems="center" height="100%">
										<Spinner size="xl" />
									</Grid>
								) : (
									isEmpty(productCategories) ? (
										<Grid placeItems="center" height="100%">
											<Text fontSize="2.4rem">No data</Text>
										</Grid>
									) : (
										productCategories?.map((item: { name: string, total: number }) => (
											<ProductCategoryItem {...{ ...item, total: item.total * -1 }}
												onClick={() => navigateToProductCategory(item)}
												p="0.75rem 1.4rem"
												borderRadius="sm"
												cursor="pointer"
												_hover={{
													bg: 'purple.800'
												}}
												_active={{
													bg: 'purple.800',
													boxShadow: 'inset 0 0 0 0.1rem var(--tuturium-colors-purple-700)'
												}}
											/>
										))
									)
								)}
							</Flex>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Flex>
		</Grid>
	)
}

export default SpendingReport