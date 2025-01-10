import withPage from '@/hoc/withPage';
import ProfileSettingsScreen from '@/screens/Profile/Settings';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {	
	return (
		<ProfileSettingsScreen />
	)
}, 'profile-settings')

export default Page;