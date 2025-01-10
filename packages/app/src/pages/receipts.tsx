import withPage from '@/hoc/withPage';
import ReceiptsScreen from '@/screens/Receipts';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {
	return (
		<ReceiptsScreen />
	)
}, 'receipts')

export default Page;