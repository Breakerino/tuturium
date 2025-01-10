import withPage from '@/hoc/withPage';
import WalletScreen from '@/screens/Wallet';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {	
	return (
		<WalletScreen />
	)
}, 'wallet')

export default Page;