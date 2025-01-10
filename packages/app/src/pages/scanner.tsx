import withPage from '@/hoc/withPage';
import ScannerScreen from '@/screens/Scanner';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {
	return (
		<ScannerScreen />
	)
}, 'scanner')

export default Page;