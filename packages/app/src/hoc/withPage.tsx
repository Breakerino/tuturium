//
import { Navigate } from "react-router-dom";

//
import layouts from '@/app/layouts';
import routes from '@/app/routes';
import { useUserContext } from '@/contexts/UserContext';

// TEMP
const withPage = <T extends JSX.IntrinsicAttributes>(PageComponent: React.FC<T>, routeID: keyof typeof routes) => {
	return (props?: T) => {
		const user = useUserContext();
		
		if ( ! (routeID in routes) ) {
			throw new Error(`Route "${routeID}" not found.`);
		}
		
		const route = routes[routeID];
		console.log('user.store.isLoggedIn', user.store.isLoggedIn);
		
		if ( route && route.type === 'private' && ! user.store.isLoggedIn ) {
			return <Navigate replace to={routes.index.path ?? '/'} />
		}
		
		if ( route && route.type === 'public' && user.store.isLoggedIn ) {
			return <Navigate replace to={routes.index.path ?? '/'} />
		}
		
		const PageLayout = route?.layout && (route.layout in layouts) ? layouts[route.layout] : layouts['default'];
		
		return ( 
			<PageLayout>
				{/* @ts-ignore */}
				<PageComponent {...props} />
			</PageLayout>
		);
	}
}

export default withPage;