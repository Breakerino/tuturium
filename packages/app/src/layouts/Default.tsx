//
import { Grid } from "@chakra-ui/react";
import React, { ReactElement } from 'react';

//
import Content from '@/containers/Content';
import Sidebar from '@/containers/Sidebar';
import Header from '@/containers/Header';

const Default: React.FC<{ children: ReactElement }> = ({ children }) => {
	return (
		<Grid width="100dvw" height="100dvh"
			gridTemplateRows={{ base: '8rem auto 6.4rem', lg: '8rem auto' }}
			gridTemplateColumns={{ lg: '30rem auto' }}
		>
			<Header gridArea={{ base: '1 / 1', lg: '1 / span 2' }}
				borderBottomWidth="0.1rem"
				borderBottomColor="purple.800"
				borderBottomStyle="solid"
			/>
			<Content gridArea={{base: '2 / 1', lg: '2 / 2'}} overflowY="auto">
				{children}
			</Content>
			<Sidebar gridArea={{ base: '3 / 1', lg: '2 / 1' }}
				position={{ base: 'fixed', lg: 'static' }}
				width="full"
				left={{ base: 0, lg: 'unset' }}
				bottom={{ base: 0, lg: 'unset' }}
				bg={{base: 'purple.900', lg: 'unset'}}
				borderStyle="solid"
				borderColor="purple.800"
				borderTopWidth={{ base: "0.1rem", lg: 0 }}
				borderRightWidth={{ lg: "0.1rem"}}
			/>
		</Grid>
	)
}

export default Default