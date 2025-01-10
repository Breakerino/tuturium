//
import { Box, chakra, Flex, Heading } from '@chakra-ui/react';
import QrScanner from 'qr-scanner';
import React from 'react';

//
import { queryClient } from '@/App';
import { useApi } from '@/app/api';
import { useNotices } from '@/modules/wooptima/notices';
import moment from 'moment';
import Button from '@/components/Button';
import { isEmpty } from 'lodash';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { FormField, FormGroup, FormSubmitHandler, FormWrapper, useValidationResolver } from '@/modules/wooptima/forms';
import { receiptCreateSchema } from '@/app/schemas';
import { VALIDATION_MESSAGES } from '@/app/constants';

const Scanner: React.FC = () => {
	const api = useApi();
	const notices = useNotices({
		containerStyle: {
			marginBottom: '8rem'
		},
	});
	
	const validationResolver = useValidationResolver({
		schema: receiptCreateSchema,
		messages: VALIDATION_MESSAGES
	});

	const form = useForm({
		defaultValues: {
			uid: '',
		},
		resolver: validationResolver,
		mode: 'onBlur',
	});

	const [qrScanner, setQrScanner] = React.useState<QrScanner | null>(null)
	const [isProcessing, setIsProcessing] = React.useState<boolean>(false)

	const videoRef = React.useRef<HTMLVideoElement | null>(null);
	const qrCodeRegionRef = React.useRef<HTMLDivElement | null>(null);

	const handleQRDecode = async (result: QrScanner.ScanResult) => {
		if (isProcessing) {
			return;
		}

		setIsProcessing(true);
		qrScanner?.pause();

		try {
			const { data: { data } } = await api.createReceipt({
				data: {
					uid: result.data
				}
			})

			console.log({ data });
			notices.add('success', `${moment(data.issuedAt).format('MMM Do YY HH:MM')} | ${data.total.toFixed(2)} ${data.currency}`, `${data.store.displayName}`)

			queryClient.invalidateQueries({
				queryKey: ['receipts']
			})
		} catch (e) {
			console.error(e);

			// @ts-ignore
			notices.add('error', e?.response?.data?.error?.message ?? 'Unknown error')
		}

		setTimeout(() => {
			setIsProcessing(false);
			qrScanner?.start();
		}, 3500)
	}

	const handleFormSubmit: FormSubmitHandler<FieldValues> = async (values) => {
		if (isEmpty(values?.uid)) {
			return;
		}

		qrScanner?.pause();

		try {
			const { data: { data } } = await api.createReceipt({
				data: {
					uid: values.uid
				}
			})

			console.log({ data });
			notices.add('success', `${moment(data.issuedAt).format('MMM Do YY HH:MM')} | ${data.total.toFixed(2)} ${data.currency}`, `${data.store.displayName}`)

			queryClient.invalidateQueries({
				queryKey: ['receipts']
			})
		} catch (e) {
			console.error(e);

			// @ts-ignore
			notices.add('error', e?.response?.data?.error?.message ?? 'Unknown error')
		}
	}

	React.useEffect(() => {
		let scanner: QrScanner;

		if (videoRef.current) {
			scanner = new QrScanner(
				// @ts-ignore
				videoRef.current,
				// @ts-ignore
				handleQRDecode,
				{ highlightScanRegion: true, maxScansPerSecond: 1, overlay: qrCodeRegionRef.current }
			);

			setQrScanner(scanner)

			scanner.start();
		}

		return () => {
			scanner?.stop();
			scanner?.destroy();
		}
	}, [])

	return (
		<Flex flexDirection="column" w="full">
			<Heading as="h1" fontSize="3.2rem" color="purple.200" fontWeight={500} m={0}>Scanner</Heading>

			<Flex flexDirection="column" overflow="hidden" position="relative" mt="2.4rem"
				borderWidth="0.1rem" borderColor="purple.800" borderStyle="solid" borderRadius="md"
			>
				<Flex flexDirection="column" gap="1.25rem" position="absolute" bottom="2rem" right="2rem" zIndex={10}>
					<Button variant="circle-icon" icon="general.flashlight" onClick={() => qrScanner?.toggleFlash()} />
				</Flex>

				<Box ref={qrCodeRegionRef}
					borderWidth="0.4rem" borderColor="purple.400" borderStyle="solid" borderRadius="md"
					width={{ base: '33.33333%', md: '25%' }}
					height={{ base: '33.33333%', md: '25%' }}
					backdropFilter="brightness(1.5)"
					zIndex={2}
				/>

				<Box
					position="absolute"
					width="100%"
					height="100%"
					background="#000"
					opacity="0.5"
					zIndex={1}
					borderRadius="md"
				/>

				<chakra.video ref={videoRef} width="100%" transformOrigin="center" transform="scale(2) !important" borderRadius="md" aspectRatio={{ base: '1 / 1', md: 'unset' }} height="100%" />
			</Flex>

			<FormProvider {...form}>
				<FormWrapper onSubmit={handleFormSubmit} rowGap="2rem" columnGap="1rem"
					flexFlow="row wrap"
					sx={{
						'--background': 'colors.purple.900',
					}}>
					<FormGroup mt="2rem">
						<FormField
							name="uid"
							label='Receipt ID'
							type="text"
							columnSpan={12}
							variant="dynamic"
						/>
					</FormGroup>

					<Button type="submit" size="sm" colorScheme="primary"
						mt="2rem" w="full"
						isLoading={isProcessing}
						isDisabled={isProcessing || form.formState.isLoading || form.formState.isSubmitting || form.formState.isValidating || form.formState.disabled || !isEmpty(form.formState.errors)}
					>Create</Button>
				</FormWrapper>
			</FormProvider>
		</Flex>
	)
}

export default Scanner;