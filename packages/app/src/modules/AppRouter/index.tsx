import React from 'react';
import { createRoutesFromElements, Route, RouteProps, RouterProvider, RouterProviderProps } from "react-router-dom";
import { routers } from './constants';
import { AppRoute, AppRouterType } from './types';

export interface AppRouterProps extends Omit<RouterProviderProps, 'router'> {
	type: AppRouterType
	routes: Record<string, AppRoute>
	context?: JSX.Element
}

const AppRouter: React.FC<AppRouterProps> = ({ type, routes, context, ...props }) => {
	if (!(type in routers)) {
		throw new Error(`Router type "${type}" is not supported.`)
	}

	const router = routers[type];

	const appRoutes = React.useMemo(() => {
		const parsedRoutes: RouteProps[] = Object.entries<AppRoute>(routes).map(([id, route]) => ({
			...route,
			id,
			index: id === 'index',
			//exact: route.path === '/',
			lazy: async () => {
				// TODO: @pages/*
				const module = await import(`../../pages/${route.name}.tsx`);
				
				return {
					loader: module?.loader,
					Component: module.default
				};
			}
		}));

		// TODO: Replace with converted array (after replacing temp AppWrapper with proper AppContext)
		return createRoutesFromElements(
			<Route element={context}>
				{parsedRoutes.map(({ id, ...route }) => <Route key={id} {...route} />)}
			</Route>
		);
	}, [routes, context]);

	// @ts-ignore
	const reactRouter = router.create(appRoutes);

	return (
		<RouterProvider router={reactRouter} {...props} />
	);
}


export default AppRouter;