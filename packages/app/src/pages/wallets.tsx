import withPage from '@/hoc/withPage';
import WalletsScreen from '@/screens/Wallets';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {
	return (
		<WalletsScreen />
	)
}, 'wallets')

export default Page;