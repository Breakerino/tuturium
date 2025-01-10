import withPage from '@/hoc/withPage';
import ReceiptScreen from '@/screens/Receipt';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {
	return (
		<ReceiptScreen />
	)
}, 'receipts')

export default Page;