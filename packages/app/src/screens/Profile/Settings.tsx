//
import { useApi } from '@/app/api';
import Button from '@/components/Button';
import { useUserContext } from '@/contexts/UserContext';
import { FormWrapper, FormGroup, FormField, FormSubmitHandler } from '@/modules/wooptima/forms';
// import { generateSalt, buf2hex, deriveMasterKey, generateUserEncryptionKey, exportKey, wrapDEK, hex2buf, encryptData, decryptData } from '@/utils/_crypto';
import { Flex, Heading } from '@chakra-ui/react';
import { identity, pickBy } from 'lodash';
import React from 'react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import CryptoJS from 'crypto-js';
// import { randomDecrypt } from '@/utils/crypto';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const ProfileSettingsScreen: React.FC = () => {
	const user = useUserContext()
	const api = useApi();

	const form = useForm({
		defaultValues: {
			username: user.store.username,
			password: ''
		},
		mode: 'onBlur',
	});

	const handleSubmit: FormSubmitHandler<FieldValues> = async (data) => {
		try {
			const sanitizedData = pickBy(data, identity);
			
			if (sanitizedData?.password) {
				// Try to retrieve the data encryption key from local storage
				let dataEncryptionKey = localStorage.getItem('dek') ?? null;
				
				// If the data encryption key is not found, generate a new one
				if (!dataEncryptionKey) {
					dataEncryptionKey = CryptoJS.lib.WordArray.random(128 / 8).toString();
				}
				
				// <TODO> To helper function
				const encryptionSalt = CryptoJS.lib.WordArray.random(128 / 8).toString();
				const keyEncryptionKey = CryptoJS.PBKDF2(sanitizedData.password, encryptionSalt, { keySize: 256 / 32, iterations: 1000 });
				
				const encryptionKey = CryptoJS.AES.encrypt(dataEncryptionKey, keyEncryptionKey.toString()).toString();
				// </TODO>
				
				sanitizedData.encryptionSalt = encryptionSalt;
				sanitizedData.encryptionKey = encryptionKey;
				
				localStorage.setItem('dek', dataEncryptionKey);
				
				// const encryptionSaltBuffer = generateSalt();
				// const masterKey = await deriveMasterKey(data.password, encryptionSaltBuffer.buffer);
				// const userEncryptionKey = await generateUserEncryptionKey();
				
				// const encryptionKeyObject = await wrapDEK(userEncryptionKey, masterKey);
				
				// sanitizedData.encryptionSalt = buf2hex(encryptionSaltBuffer.buffer);
				// sanitizedData.encryptionKey = JSON.stringify(encryptionKeyObject);
			}
			
			// console.log({encryptionKey: user.store.encryptionKey});
			
			// const userEncKey = await window.crypto.subtle.importKey(
			// 	'raw',
			// 	hex2buf(user.store.encryptionKey),
			// 	{ name: 'AES-GCM' },
			// 	true,
			// 	['encrypt', 'decrypt']
			// );
			
			//const response = await api.updateUser({ data: sanitizedData });
			await api.updateUser({ data: sanitizedData });
			
			// const encrypted = JSON.parse(response.data.data.encryptedData);
			// const decrypted = randomDecrypt(localStorage.getItem('dek') as any, encrypted);
			
			// console.log({decrypted});
			
			// await user.actions.login({ identifier, password });
		} catch (error) {
			console.error(error);
		}

		return true;
	}

	return (
		<Flex flexDirection="column" w="full" height="fit-content">
			<Heading as="h1" fontSize="3.2rem" color="purple.200" fontWeight={500}>Settings</Heading>
			<Flex w="100%" maxWidth="50rem" sx={{
				'--background': 'colors.purple.900'
			}}>
				<FormProvider {...form}>
					<FormWrapper onSubmit={handleSubmit} columns={{ base: 1 }} rowGap="0rem" columnGap="1rem">
						<FormGroup data-id="personal">
							<FormField
								name="username"
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
						<Button w="full" type="submit" size="md" colorScheme="primary" mt="2rem"
							isDisabled={!form.formState.isDirty || form.formState.isSubmitting || form.formState.isLoading}
						>
							Update</Button>
					</FormWrapper>
				</FormProvider>
			</Flex>
		</Flex>
	)
}

export default ProfileSettingsScreen;