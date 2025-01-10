import routes from '@/app/routes';
import { useUserContext } from '@/contexts/UserContext';
import withPage from '@/hoc/withPage';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface PageProps extends JSX.IntrinsicAttributes {
	params: Record<string, string>
}

const Page = withPage<PageProps>(() => {
	const navigate = useNavigate();
	const user = useUserContext();
	
	React.useEffect(() => {
		if ( user.store.isLoggedIn ) {
			return navigate(routes.dashboard.path);
		}
		
		return navigate(routes.login.path);
	}, []);
	
	return null;
}, 'index')

export default Page;