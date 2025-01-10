import { createBrowserRouter, createHashRouter } from 'react-router-dom';

export const routers = {
	browser: {
		create: createBrowserRouter,
	},
	hash: {
		hash: createHashRouter
	}
}