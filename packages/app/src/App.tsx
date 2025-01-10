//
import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Dev
//import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

//
import routes from '@/app/routes';
import AppRouter from '@/modules/AppRouter';
import { AppContextProvider } from '@/contexts/AppContext';
import { UserContextProvider } from './contexts/UserContext';
import { Box } from '@chakra-ui/react';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
})

const App = () => {
	return (
		<AppRouter
			type="browser"
			routes={routes}
			future={{ v7_startTransition: true }}
			context={(
				<QueryClientProvider client={queryClient}>
					<Box fontSize="16px">
						{/* <ReactQueryDevtools initialIsOpen={false} /> */}
					</Box>
					<AppContextProvider>
						<UserContextProvider>
							<Outlet />
						</UserContextProvider>
					</AppContextProvider>
				</QueryClientProvider>
			)}
		/>
	);
}

export default App;