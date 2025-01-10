import React from 'react';
import { Button, Flex } from '@strapi/design-system';
import { getFetchClient } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';
import axios from 'axios';

const fetchClient = getFetchClient();

const HomePage = () => {
	const [isWipingData, setIsWipingData] = React.useState<boolean>(false);
	const [isSyncingTransactions, setIsSyncingTransactions] = React.useState<boolean>(false);
	const [isPairingReceiptsToTransactions, setIsPairingReceiptsToTransactions] = React.useState<boolean>(false);

	const [requestLog, setRequestLog] = React.useState<any[]>([]);

	const updateRequestLog = ({id, type = 'success', message}: any) =>{
		setRequestLog(log => [...log, `[${new Date().toISOString()}] ${id} | ${type.toUpperCase()}: ${message}`]);
	}
	
	const handleWipeData = async () => {
		setIsWipingData(true);
		
		try {
			const response = await fetchClient.post(`/${pluginId}/debug/wipe`);
			console.debug({ response });
			updateRequestLog({ id: 'Wipe data', message: response?.data?.message })
		} catch (error: any) {
			console.debug({ error });
			updateRequestLog({ id: 'Wipe data', type: 'error', message: error?.data?.message })
		}

		setIsWipingData(false);
	}

	const handleSyncTransactions = async () => {
		setIsSyncingTransactions(true);

		try {
			const response = await axios.post(`/api/bank/sync`);
			updateRequestLog({ id: 'Sync Transactions', message: JSON.stringify(response.data, null, 2) })
		} catch (error: any) {
			console.debug({ error });
			updateRequestLog({ id: 'Sync Transactions', type: 'error', message: JSON.stringify(error.data, null, 2) })
		}

		setIsSyncingTransactions(false);
	}

	const handlePairReceiptsToTransactions = async () => {
		setIsPairingReceiptsToTransactions(true);

		try {
			const response = await axios.post(`/api/receipts/pair`);
			console.debug({ response });
			updateRequestLog({ id: 'Pair Transactions', message: JSON.stringify(response.data, null, 2) })
		} catch (error: any) {
			console.debug({ error });
			updateRequestLog({ id: 'Pair Transactions', type: 'error', message: JSON.stringify(error.data, null, 2) })
		}

		setIsPairingReceiptsToTransactions(false);
	}
	
	// TODO: Input field for JWT token (authorized user) / Use SwaggerUI

	return (
		<Flex direction="column" alignItems="flex-start"
			style={{
				padding: "2rem",
				color: 'white',
				width: "calc(100vw - 14rem)",
				height: "100vh",
			}}>
			<h1 style={{ fontSize: '2rem' }}>Tuturium Tools</h1>
			<Flex marginTop="2rem" direction="column" alignItems="flex-start" gap="1rem">
				<h2 style={{ fontSize: '1.6rem' }}>Debug</h2>
				<Flex gap="1rem" direction="column" alignItems="flex-start">
					<Flex direction="row" alignItems="flex-start" gap="0.5rem">
						<Button loading={isWipingData} size="lg" onClick={handleWipeData}>Wipe data</Button>
						<Button loading={isSyncingTransactions} size="lg" onClick={handleSyncTransactions}>Sync transactions</Button>
						<Button loading={isPairingReceiptsToTransactions} size="lg" onClick={handlePairReceiptsToTransactions}>Pair receipts to transactions</Button>
					</Flex>

					<pre style={{
						width: 'calc(100vw - 18rem)',
						height: 'calc(100vh - 15rem)',
						overflow: 'auto',
						background: '#0d0d16',
						padding: '1.25rem'
					}}>
						{requestLog.map(logMessage => (
							<Flex direction="column" alignItems="flex-start" style={{marginTop: '20px'}}>
								<p>{logMessage}</p>
								<span style={{
									display: 'block',
									width: '100%',
									height: '1px',
									background: '#ffffff21',
									marginTop: '20px'
								}} />
							</Flex>
						))}
					</pre>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default HomePage;
