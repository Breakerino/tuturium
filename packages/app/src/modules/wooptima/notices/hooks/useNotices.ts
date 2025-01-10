import { unescape } from 'lodash';

import { generateID } from '../functions';
import { NoticeType } from '../types';
import { ToastPosition, useToast, UseToastOptions } from '@chakra-ui/react';

export interface UseNoticesProps extends UseToastOptions {
	duration?: number;
	position?: ToastPosition;
}

const useNotices = ({ duration = 3500, position, ...props }: UseNoticesProps) => {
	const toast = useToast({ ...props, duration, position, isClosable: true, variant: 'subtle'});
	
	const showNotice = (type: NoticeType, message: string, title?: string, id?: string ) => {
		if ( ! id ) {
			id = generateID();
		}
		
		toast({ id: `${type}_${id}`, description: unescape(message), title, status: type})
	}
	
	return { add: showNotice, clear: toast.closeAll };
}

export default useNotices;