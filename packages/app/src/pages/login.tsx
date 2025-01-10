import withPage from '@/hoc/withPage';
import LoginScreen from '@/screens/Login';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {
	return (
		<LoginScreen />
	)
}, 'login')

export default Page;