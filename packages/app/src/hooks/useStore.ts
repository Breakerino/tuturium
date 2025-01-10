import { get, has, set } from 'lodash';
import React from 'react';

const useStore = <T extends Record<string, any>>(initialStore: T): [T, any, (path: keyof T, defaultValue: any) => void, React.Dispatch<React.SetStateAction<T>>, (path?: keyof T) => void] => {
	const [store, updateStore] = React.useState<T>(initialStore); // TODO: Replace with useReducer (optimise)

	const getStoreState = React.useCallback((path: string, defaultValue: unknown) => get(store, path, defaultValue), [store]);
	
	/**
	 * Set state
	 *
	 * @param string path
	 * @param mixed value
	 *
	 * @returns void
	 */
	const setStoreState = (path: keyof T, value: any) => {
		if (!has(initialStore, path)) throw Error(`"${String(path)}" is not a valid state.`);

		updateStore((prevState: T) => {
			const newState = { ...prevState };
			const previousValue = get(prevState, path);
			const newValue = value instanceof Function ? value(previousValue) : value;

			console.debug(`Setting state "${String(path)}" to "${JSON.stringify(newValue)}"`);

			set(newState, path, newValue);
			return newState;
		});
	};
	
	const resetStore = (path?: keyof T) => {
		if ( ! path )  {
			return updateStore(initialStore);
		}
		
		setStoreState(path, get(initialStore, path));
	}

	return [store, getStoreState, setStoreState, updateStore, resetStore];
};

export default useStore;