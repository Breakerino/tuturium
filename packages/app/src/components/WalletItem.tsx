//
import React from 'react';
import { Flex, FlexProps, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

//
import Button from '@/components/Button';
import { Wallet as WalletType } from '@/app/types';
import { formatAmount } from '@/app/functions';


export interface WalletItemProps extends WalletType, FlexProps {
	description: string;
	isSyncing?: boolean;
	onSync?: () => void;
}

const WalletItem: React.FC<WalletItemProps> = ({uid, name, description, type, balance, currency, iban, onSync: handleSync, isSyncing, ...props}) => {
	const navigate = useNavigate()
	const walletRef = React.useRef<HTMLDivElement|null>(null);
	
	return (
		<Flex
			background="purple.900" color="purple.200"
			borderWidth="0.1rem" borderColor="purple.800" borderStyle="solid" borderRadius="md"
			alignItems="center"
			justifyContent="space-between"
			px={{base: '2.2rem', md: '2.8rem'}}
			py={{base: '1.8rem', md: '2.2rem'}}
			cursor="pointer"
			_hover={{
				bg: 'purple.800',
				borderColor: "purple.600"
			}}
			_active={{
				bg: 'purple.800',
				borderColor: "purple.700"
			}}
			// @ts-ignore
			onClick={(e) => ! ['button', 'svg', 'use'].includes(e.target?.nodeName.toLowerCase()) && navigate(`/wallets/${uid}`)}
			ref={walletRef}
			{...props}
		>
			<Flex direction="column" gap={{base: '1.5rem', md: '2rem'}}>
				<Flex direction="column">
					<Text as="strong" fontSize={{base: '2rem', md: '2.6rem'}} fontWeight={500} lineHeight={1}>{name}</Text>
					<Text as="small" fontSize="1.4rem" color="purple.400" mt={{base: '0.35rem', md: '0.5rem'}}>{description}</Text>
				</Flex>

				<Flex fontSize={{base: '1.6rem', md: '2.4rem'}} lineHeight={1}>{formatAmount(balance, currency)}</Flex>
			</Flex>
			<Flex flexDirection="column" justifyContent="space-between" h="full" gap="1rem">
				{type === 'bank' && <Button variant="circle-icon" icon="general.sync" onClick={handleSync} isLoading={isSyncing} />}
				<Button variant="circle-icon" icon="general.chevron-right" mt="auto" href={`/wallets/${uid}`} />
			</Flex>
		</Flex>
	)
}

export default WalletItem;