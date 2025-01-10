//
import React from 'react';

//
import useStore from '@/hooks/useStore';

export interface AppContextProps {
	children?: React.ReactNode | React.ReactNode[];
}

export interface AppContextStore {
	state: boolean
}

export type AppContextActions = {
	getState: (path: keyof AppContextStore, defaultValue: any) => any;
	setState: (path: keyof AppContextStore, value: any) => void;
	resetState: () => void;
}

export interface AppContextOptions {
	config: Record<string, any>
	theme: Record<string, any>
	translations: Record<string, any>
}

export interface AppContextProviderProps {
	store: AppContextStore,
	actions: AppContextActions
}

export const initialStore: AppContextStore = {
	state: true
};

const AppContext = React.createContext<AppContextProviderProps>({
	store: initialStore,
	actions: {
		getState: () => null,
		setState: () => void 0,
		resetState: () => void 0
	}
});

export const AppContextProvider: React.FC<AppContextProps> = ({ children }) => {
	const [store, getState, setState, , resetState] = useStore<AppContextStore>(initialStore);

	return (
		<AppContext.Provider value={{ store, actions: { getState, setState, resetState } }}>
			{children}
		</AppContext.Provider>
	)
};

export const useAppContext = () => React.useContext(AppContext);