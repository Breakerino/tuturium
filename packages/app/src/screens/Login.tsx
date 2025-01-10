//
import { Flex, Grid, Heading } from '@chakra-ui/react';
import React from 'react';

//
import routes from '@/app/routes';
import Button from '@/components/Button';
import { useUserContext } from '@/contexts/UserContext';
import { FormField, FormGroup, FormSubmitHandler, FormWrapper } from '@/modules/wooptima/forms';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const LoginScreen: React.FC = () => {
	const user = useUserContext();
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			identifier: '',
			password: ''
		},
		mode: 'onBlur',
	});

	// @ts-ignore
	const handleSubmit: FormSubmitHandler<FieldValues> = async ({ identifier, password }, form, event) => {
		console.log('handleSubmit', {identifier, password})
		
		try {
			await user.actions.login({ identifier, password });
			navigate(routes.index.path)
		} catch (error) {
			console.error(error);
			
			form.setError("password", {
				// @ts-ignore
				message: error?.response?.data?.error?.message
			})
		}

		return true;
	}

	return (
		<Grid placeItems="center" w="full" h="full">
			<Flex flexDirection="column"
				w="full" h="auto" maxW="48rem" minH="32rem" p="3.2rem"
				borderWidth="0.1rem" borderColor="purple.800" borderStyle="solid" borderRadius="md"
				sx={{
					'--background': 'colors.purple.900',
					bg: "var(--background)",
					color: 'purple.200'
				}}
			>
				<Heading color="purple.100">Login</Heading>

				<FormProvider {...form}>
					<FormWrapper onSubmit={handleSubmit} columns={{ base: 1 }} rowGap="0rem" columnGap="1rem">
						<FormGroup data-id="personal">
							<FormField
								name="identifier"
								label='Username'
								variant="dynamic"
								aria-autocomplete="none"
								/>
							<FormField
								name="password"
								label='Password'
								type="password"
								variant="dynamic"
								aria-autocomplete="none"
							/>
						</FormGroup>

						{/* TODO: isDisabled */}
						<Button w="full" type="submit" size="md" colorScheme="primary" mt="2rem">Log in</Button>
					</FormWrapper>
				</FormProvider>
			</Flex>
		</Grid>
	)
}

export default LoginScreen;