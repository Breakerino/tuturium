//
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay, Text, useMediaQuery } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { isArray, isEmpty } from 'lodash';
import React from 'react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';

//
import { FormField, FormGroup, FormSubmitHandler, FormWrapper, useValidationResolver } from '@/modules/wooptima/forms';

//
import { queryClient } from '@/App';
import { useApi } from '@/app/api';
import { VALIDATION_MESSAGES } from '@/app/constants';
import { transactionCreateSchema } from '@/app/schemas';
import { Wallet } from '@/app/types';
import Button from '@/components/Button';
import Icon from '@/components/Icon';

export interface CreateTransactionDrawerProps {
	isOpen: boolean;
	onClose: () => void
	wallet: Wallet
}

const CreateTransactionDrawer: React.FC<CreateTransactionDrawerProps> = ({ onClose, isOpen, wallet }) => {
	const api = useApi();

	const [isDesktop] = useMediaQuery('(min-width: 992px)')

	const validationResolver = useValidationResolver({
		schema: transactionCreateSchema,
		messages: VALIDATION_MESSAGES
	});

	const form = useForm({
		defaultValues: {
			date: '',
			amount: '',
			description: '',
			category: ''
		},
		resolver: validationResolver,
		mode: 'onBlur',
	});

	const { formState: {
		isDirty,
		isLoading,
		isSubmitting,
		isValidating,
		disabled,
		errors
	} } = form;

	const transactionCategoriesQuery = useQuery<Record<string, any>>({
		queryKey: ['transaction-categories'],
		queryFn: async () => {
			try {
				const { status, data: { data } } = await api.getTransactionCategories();

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

	const createTransactionMutation = useMutation<Record<string, any>>({
		mutationFn: async (inputData) => {
			try {
				const { status, data: { data } } = await api.createTransaction({
					// @ts-ignore
					data: inputData
				});

				if (status !== 200) {
					return [];
				}

				queryClient.invalidateQueries({
					queryKey: ['wallet', wallet.uid]
				})

				queryClient.invalidateQueries({
					queryKey: ['spending-report']
				});

				return data;
			} catch (e) {
				if (e instanceof AxiosError && e.response?.status === 401) { }
				console.error(e);
			}
			return []
		}
	})

	const transactionCategoriesOptions = React.useMemo(() => {
		if (!transactionCategoriesQuery?.data || !isArray(transactionCategoriesQuery?.data)) {
			return [];
		}

		return transactionCategoriesQuery.data.map(({ uid, name, type }: Record<string, any>) => ({ label: name, value: uid, type }))
	}, [transactionCategoriesQuery])

	const handleSubmit: FormSubmitHandler<FieldValues> = async (values) => {
		// @ts-ignore
		await createTransactionMutation.mutateAsync({
			date: values.date,
			amount: Number(values.amount),
			description: values.description,
			category: values.category,
			wallet: wallet.uid
		});

		// Reset form values
		form.reset();

		// Close drawer
		onClose();

		return true;
	}

	return (
		<Drawer placement={isDesktop ? 'right' : 'bottom'} onClose={onClose} isOpen={isOpen}>
			<DrawerOverlay />
			<DrawerContent>
				<DrawerHeader borderBottomWidth='1px'>
					<Text>Add transaction</Text>
					<DrawerCloseButton />
				</DrawerHeader>
				<DrawerBody>
					<FormProvider {...form}>
						<FormWrapper onSubmit={handleSubmit} columns={{ base: 1, md: 2 }} rowGap="2rem" columnGap="1rem">
							<FormGroup mt="2rem">
								<FormField
									name="date"
									label='Date'
									type="date"
									columnSpan={12}
									inputAddon={<Icon id="general.date" pointerEvents="none" background="purple.800" p="0.1rem" mt="-0.5rem" />}
								/>
								<FormField
									name="amount"
									label='Amount'
									type="number"
									inputAddon={<Text as="strong">{wallet.currency}</Text>}
									columnSpan={12}
								/>
								<FormField
									name="category"
									label='Category'
									type="select"
									inputProps={{
										options: transactionCategoriesOptions
									}}
									zIndex={10}
									columnSpan={12}
								/>
								<FormField
									name="description"
									label='Description'
									type="text"
									columnSpan={12}
								/>
							</FormGroup>

							<Button type="submit" size="sm" colorScheme="primary"
								mt="2rem" w="full" maxWidth="32rem"
								isLoading={createTransactionMutation.isPending}
								isDisabled={!isDirty || isLoading || isSubmitting || isValidating || disabled || !isEmpty(errors)}
							>Add transaction</Button>
						</FormWrapper>
					</FormProvider>
				</DrawerBody>
			</DrawerContent>
		</Drawer>
	)
}

export default CreateTransactionDrawer