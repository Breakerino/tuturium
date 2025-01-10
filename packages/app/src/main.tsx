// Vendor
import { ChakraBaseProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

// 
import App from '@/App';
import theme from '@/app/theme';

const rootElement = document.getElementById('root');

if (!(rootElement instanceof HTMLElement)) {
	throw new Error('App root element is not present.')
}

const root = ReactDOM.createRoot(rootElement);

root.render(
	<React.StrictMode>
		<ChakraBaseProvider theme={theme}>
			<App />
		</ChakraBaseProvider>
	</React.StrictMode>,
);