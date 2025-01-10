import { AppIcons } from '@/app/types';
import { Icon as ChakraIcon, LayoutProps, ColorProps, chakra, PropsOf,  } from '@chakra-ui/react';
import React from 'react';

export interface IconProps extends Omit<PropsOf<typeof chakra.svg>, 'id' | 'width' | 'height'> {
	id: keyof typeof AppIcons;
	color?: ColorProps['color'];
	size?: LayoutProps['width'];
}

const Icon: React.FC<IconProps> = ({ id, size, ...props }) => {
	const iconURI = React.useMemo(() => {
		const iconID = `tuturium-${AppIcons[id]}`;
		return import.meta.env.DEV ? `#${iconID}` : `${import.meta.env.BASE_URL}icons/icons.svg#${iconID}`;
	}, [id]);

	return (<>
		<ChakraIcon {...props} width={size === '100%' ? 'auto' : size} height={size} aria-hidden="true">
			<use xlinkHref={iconURI}></use>
		</ChakraIcon>
	</>
	);
}

Icon.displayName = 'Icon';

export default Icon;