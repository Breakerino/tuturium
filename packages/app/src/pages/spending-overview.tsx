import withPage from '@/hoc/withPage';
import SpendingOverviewScreen from '@/screens/SpendingOverview';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {
	return (
		<SpendingOverviewScreen />
	)
}, 'spending-overview')

export default Page;