import withPage from '@/hoc/withPage';
import ProductCategoryScreen from '@/screens/ProductCategory';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {	
	return (
		<ProductCategoryScreen />
	)
}, 'transaction-category')

export default Page;