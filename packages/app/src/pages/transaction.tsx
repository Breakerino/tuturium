import withPage from '@/hoc/withPage';
import TransactionScreen from '@/screens/Transaction';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {	
	return (
		<TransactionScreen />
	)
}, 'transaction')

export default Page;