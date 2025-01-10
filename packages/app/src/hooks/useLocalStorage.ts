import { get, set } from 'lodash'
import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
} from 'react'
import useEventCallback from './useEventCallback'
import useEventListener from './useEventListener'

declare global {
	interface WindowEventMap {
		'local-storage': CustomEvent
	}
}

type SetValue<T> = Dispatch<SetStateAction<T>>

function useLocalStorage<T>(key: string, initialValue: T, lifespan?: number): [T, SetValue<T>, any] {
	// Get from local storage then
	// parse stored json or return initialValue
	const readValue = useCallback((): T => {
		// Prevent build error "window is undefined" but keeps working
		if (typeof window === 'undefined') {
			return initialValue
		}

		try {
			const item = window.localStorage.getItem(key)

			if (!item) {
				return initialValue;
			}

			const localData = decodeJSON(item);

			if (lifespan && localData?.time) {
				if ((localData?.time + lifespan) < new Date().getTime()) {
					console.debug(`Local storage | ${key} | Expired at ${new Date(localData?.time + lifespan).toISOString()}`)		
					window.localStorage.removeItem(key);
					
					return initialValue;
				}

				console.debug(`Local storage | ${key} | Stale (expires at: ${new Date(localData?.time + lifespan).toISOString()})`)
				return localData.data as T;
			}

			return (localData.data ?? initialValue) as T;
		} catch (error) {
			console.warn(`Error reading localStorage key “${key}”:`, error)
			return initialValue
		}
	}, [initialValue, key])

	// State to store our value
	// Pass initial state function to useState so logic is only executed once
	const [storedValue, setStoredValue] = useState<T>(readValue)

	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const setValue: SetValue<T> = useEventCallback(value => {
		// Prevent build error "window is undefined" but keeps working
		if (typeof window === 'undefined') {
			console.warn(
				`Tried setting localStorage key “${key}” even though environment is not a client`,
			)
		}

		try {
			// Allow value to be a function so we have the same API as useState
			const newValue = value instanceof Function ? value(storedValue) : value

			// Save to local storage
			window.localStorage.setItem(key, encodeJSON({
				time: new Date().getTime(),
				data: newValue
			}))

			// Save state
			setStoredValue(newValue)

			// We dispatch a custom event so every useLocalStorage hook are notified
			window.dispatchEvent(new Event('local-storage')) // TODO
		} catch (error) {
			console.warn(`Error setting localStorage key “${key}”:`, error)
		}
	})

	useEffect(() => {
		setStoredValue(readValue())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleStorageChange = useCallback(
		(event: StorageEvent | CustomEvent) => {
			if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
				return
			}
			setStoredValue(readValue())
		},
		[key, readValue],
	)

	// this only works for other documents, not the current one
	useEventListener('storage', handleStorageChange)

	// this is a custom event, triggered in writeValueToLocalStorage
	// See: useLocalStorage()
	useEventListener('local-storage', handleStorageChange)

	/**
	 * Set state
	 * 
	 * @param string path
	 * @param mixed value
	 * 
	 * @returns void
	 */
	const setState = (path: string, value: any) => {
		//if (!has(initialStore, path)) throw Error(`"${path}" is not a valid state.`);

		setValue((prevState: any) => {
			const newState = { ...prevState };
			const previousValue = get(prevState, path);
			const newValue = value instanceof Function ? value(previousValue) : value;

			console.debug(`[Wooptima | useLocalStorage]`, `Setting state "${path}" to "${newValue}"`);

			set(newState, path, newValue);
			return newState;
		});
	}

	return [storedValue, setValue, setState]
}

export default useLocalStorage;

// A wrapper for "JSON.parse()"" to support "undefined" value
function decodeJSON<T>(value: string | null): { time: number | null, data: T | null } {
	try {
		return value === 'undefined' ? undefined : JSON.parse(value ?? '')
	} catch {
		// TODO: Throw
		console.error('json decoding error', { value })
		return { time: null, data: null }
	}
}

function encodeJSON<T = Record<string, any>>(value: T) {
	try {
		// @ts-ignore
		return JSON.stringify(value, (key, value) => {
			if (value === undefined) {
				return null;
			}
			return value;
		});
	} catch {
		// TODO: Throw
		console.error('json encoding error', { value })
		return '{}';
	}
}