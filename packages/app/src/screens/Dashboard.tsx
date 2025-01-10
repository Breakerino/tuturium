//
import { Flex, Heading } from '@chakra-ui/react';
import React from 'react';

//
import SpendingReport from '@/containers/SpendingReport';
import Wallets from '@/containers/Wallets';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const DashboardScreen: React.FC = () => {
	return (
		<Flex flexDirection="column" w="full" height="fit-content">
			<Heading as="h1" fontSize="3.2rem" color="purple.200" fontWeight={500}>Dashboard</Heading>
			<Wallets
				gridTemplateColumns="repeat(auto-fit, minmax(28rem, 1fr))"
				gap={{base: '1.6rem', md: '2.4rem'}}
				mt="2.4rem"
			/>
			<SpendingReport
				background="purple.900" color="purple.200"
				borderWidth="0.1rem" borderColor="purple.800" borderStyle="solid" borderRadius="md"
				mt={{base: '1.6rem', md: '2.4rem'}}
			/>
		</Flex>
	)
}

export default DashboardScreen;