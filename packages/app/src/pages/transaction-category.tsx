import withPage from '@/hoc/withPage';
import TransactionCategoryScreen from '@/screens/TransactionCategory';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {	
	return (
		<TransactionCategoryScreen />
	)
}, 'transaction-category')

export default Page;