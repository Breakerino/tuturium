//
import { Flex, Heading } from '@chakra-ui/react';
import React from 'react';

//
import Wallets from '@/containers/Wallets';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const WalletsScreen: React.FC = () => {
	return (
		<Flex flexDirection="column" w="full">
			<Heading as="h1" fontSize="3.2rem" color="purple.200" fontWeight={500} m={0}>Wallets</Heading>

			<Wallets
				gap={{base: '1.6rem', md: '2.4rem'}} gridTemplateColumns="repeat(auto-fit, minmax(34rem, 1fr))"
				mt="2.4rem"
			/>
		</Flex>
	)
}

export default WalletsScreen