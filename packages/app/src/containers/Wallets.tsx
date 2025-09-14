//
import WalletItem from '@/components/WalletItem';
import { Grid, GridItem, GridProps, Spinner } from '@chakra-ui/react';
import React from 'react';

//
import { useApi } from '@/app/api';
import { formatIBAN } from '@/app/functions';
import { Wallet as WalletType } from '@/app/types';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/App';
import { isArray } from 'lodash';

export interface WalletsProps extends GridProps {
}

const Wallets: React.FC<WalletsProps> = ({ ...props }) => {
	const api = useApi();

	const walletsQuery = useQuery<WalletType[]>({
		queryKey: ['wallets'],
		queryFn: async () => {
			try {
				const { status, data: { data } } = await api.getWallets();

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

	const [syncedWallets, setSyncedWallets] = React.useState<string[]>([]);

	const handleWalletSync = async (wallet: WalletType) => {
		setSyncedWallets((value) => [...value, wallet.uid]);

		await api.syncWallet({
			urlParams: {
				uid: wallet.uid
			}
		});

		setSyncedWallets((value) => value.filter((walletUID) => walletUID !== wallet.uid));

		queryClient.invalidateQueries({
			queryKey: ['wallets']
		});
	}

	if (walletsQuery.isLoading || ! isArray(walletsQuery.data)) {
		return (
			<Grid {...props} h="14.2rem">
				{Array.from({ length: 3 }).map((_, index) => (
					<GridItem
						as={Grid}
						key={index}
						placeItems="center"
						background="purple.900" color="purple.200"
						borderWidth="0.1rem" borderColor="purple.800" borderStyle="solid" borderRadius="md"
						px={{ base: '2.2rem', md: '2.8rem' }}
						py={{ base: '1.8rem', md: '2.2rem' }}
					>
						<Spinner size="md" />
					</GridItem>
				))}
			</Grid>
		)
	}

	return (
		<Grid {...props}>
			{walletsQuery.data?.map(({ iban, type, ...wallet }) => (
				<WalletItem
					{...wallet}
					key={wallet.uid}
					onSync={() => handleWalletSync({ ...wallet, iban, type })}
					isSyncing={syncedWallets.includes(wallet.uid)}
					type={type}
					description={iban ? formatIBAN(iban) : 'Wallet'}
					flex={1}
				/>
			))}
		</Grid>
	)
}

export default Wallets