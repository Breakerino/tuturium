import withPage from '@/hoc/withPage';
import DashboardScreen from '@/screens/Dashboard';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {
	return (
		<DashboardScreen />
	)
}, 'dashboard')

export default Page;