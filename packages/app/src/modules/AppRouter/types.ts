import layouts from '@/app/layouts';
import { routers } from './constants';

export interface AppRoute {
	name?: string;
	title?: string;
	path: string;
	to?: string; // redirect
	layout?: keyof typeof layouts; 
	type: 'global' | 'public' | 'redirect' | 'private' | 'error',
}

export type AppRouterType = keyof typeof routers;