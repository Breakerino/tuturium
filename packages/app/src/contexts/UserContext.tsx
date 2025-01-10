//
import React from 'react';

//
import useStore from '@/hooks/useStore';
import { useApi } from '@/app/api';
import { isEmpty, pick } from 'lodash';
import useLocalStorage from '@/hooks/useLocalStorage';
// import { buf2hex, deriveMasterKey, exportKey, hex2buf, importKey } from '@/utils/_crypto';

export interface UserContextProps {
	children?: React.ReactNode | React.ReactNode[];
}

export interface UserContextStore {
	isLoggedIn: boolean | null,
	authToken: string,
	id: number,
	uid: string,
	username: string,
	email: string,
	encryptionKey: string
}

export type UserContextActions = {
	login: (credentials: { identifier: string, password: string }) => Promise<void>;
	logout: () => void;
}

export interface UserContextProviderProps {
	store: UserContextStore,
	actions: UserContextActions
}

export const initialStore: UserContextStore = {
	isLoggedIn: null,
	authToken: '',
	id: 0,
	uid: '',
	username: '',
	email: '',
	encryptionKey: ''
};

const UserContext = React.createContext<UserContextProviderProps>({
	store: initialStore,
	actions: {
		login: async () => void 0,
		logout: async () => void 0,
	}
});

const USER_LOCAL_STORAGE_KEY = 'tuturium_user';
const USER_LOCAL_STORAGE_LIFESPAN = 7 * 60 * 60 * 24 * 1000; // 7d

export const UserContextProvider: React.FC<UserContextProps> = ({ children }) => {
	// @ts-ignore
	const [store, getState, setState, updateStore, resetState] = useStore<UserContextStore>(initialStore);
	// @ts-ignore
	//const [sharedStore, updateSharedStore, setSharedState] = useLocalStorage<Pick<UserContextStore, 'isLoggedIn' | 'authToken' | 'id' | 'uid' | 'username' | 'email' | 'encryptionKey'>>(
	const [sharedStore, updateSharedStore, setSharedState] = useLocalStorage<Pick<UserContextStore, 'isLoggedIn' | 'authToken' | 'id' | 'uid' | 'username' | 'email'>>(
		USER_LOCAL_STORAGE_KEY,
		//pick(initialStore, ['isLoggedIn', 'authToken', 'id', 'uid', 'username', 'email', 'encryptionKey']),
		pick(initialStore, ['isLoggedIn', 'authToken', 'id', 'uid', 'username', 'email']),
		USER_LOCAL_STORAGE_LIFESPAN
	);

	const api = useApi();

	React.useEffect(() => {
		setState('isLoggedIn', !isEmpty(sharedStore.authToken));
	}, []);

	const login = async (credentials: { identifier: string, password: string }) => {
		const { data } = await api.loginUser({ data: credentials });

		if (isEmpty(data?.jwt)) {
			return;
		}

		// // Retrieve wrappedKey and kdfSalt from the user record
		// const { encryptionKey, encryptionSalt } = data.user;

		// // Convert the kdfSalt from hex to ArrayBuffer using .buffer
		// const saltUint8 = hex2buf(encryptionSalt); // returns a Uint8Array
		
		// function toArrayBuffer(bufferLike: ArrayBufferLike) {
		// 	const uint8 = new Uint8Array(bufferLike);
		// 	const copy = new ArrayBuffer(uint8.byteLength);
		// 	new Uint8Array(copy).set(uint8);
		// 	return copy;
		// }
		
		// const saltBuffer = toArrayBuffer(saltUint8.buffer); // make sure it's a plain ArrayBuffer

		// // Derive the master key from the credentials password and the salt.
		// const masterKey = await deriveMasterKey(credentials.password, saltBuffer);

		// // Parse the wrappedKey JSON object.
		// const wrappedKeyObj = JSON.parse(encryptionKey);

		// // Convert wrapped key and iv from hex to ArrayBuffer.
		// const wrappedKeyBuffer = toArrayBuffer(hex2buf(wrappedKeyObj.wrappedKey).buffer);
		// const ivBuffer = toArrayBuffer(hex2buf(wrappedKeyObj.iv).buffer);

		// // Unwrap the DEK using the master key. This returns a CryptoKey.
		// const userEncKey = await window.crypto.subtle.unwrapKey(
		// 	'raw',                            // format of the key to unwrap
		// 	wrappedKeyBuffer,                 // wrapped key as an ArrayBuffer
		// 	masterKey,                        // unwrapping key (CryptoKey)
		// 	{ name: 'AES-GCM', iv: ivBuffer },// algorithm used during wrapping
		// 	{ name: 'AES-GCM', length: 256 },  // algorithm for the unwrapped key
		// 	true,                             // extractable: true if you need to export it later
		// 	['encrypt', 'decrypt']            // key usages for the unwrapped key
		// );

		// // Now, userEncKey is already a CryptoKey usable for encrypt/decrypt.
		// // If you need to export it as a hex string, call exportKey:
		// const userKeyRawExported = await exportKey(userEncKey); // returns an ArrayBuffer
		// const userKeyHex = buf2hex(userKeyRawExported);
		
		// console.log({userKeyHex});
		

		//setState('encryptionKey', userKeyHex);
		
		updateSharedStore({
			authToken: data.jwt,
			isLoggedIn: true,
			//encryptionKey: userKeyHex,
			...pick(data.user, ['id', 'uid', 'username', 'email'])
		});

		//setState('isLoggedIn', true);
	}

	const logout = async () => {
		updateSharedStore({ ...initialStore, isLoggedIn: false });
	}

	return (
		<UserContext.Provider value={{ store: { ...store, ...sharedStore }, actions: { login, logout } }}>
			{children}
		</UserContext.Provider>
	)
};

export const useUserContext = () => React.useContext(UserContext);