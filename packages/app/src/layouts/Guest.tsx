//
import { Grid } from "@chakra-ui/react";
import React, { ReactElement } from 'react';

//
import Content from '@/containers/Content';
import Header from '@/containers/Header';

const Default: React.FC<{ children: ReactElement }> = ({ children }) => {
	return (
		<Grid width="100dvw" height="100dvh"
			gridTemplateRows="8rem auto"
			gridTemplateColumns="30rem auto"
		>
			<Header gridArea="1 / span 2"
				borderBottomWidth="0.1rem"
				borderBottomColor="purple.800"
				borderBottomStyle="solid"
			/>
			<Content gridArea="2 / span 2">{children}</Content>
		</Grid>
	)
}

export default Default