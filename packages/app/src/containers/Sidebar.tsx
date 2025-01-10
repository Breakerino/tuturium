//
import { Flex, FlexProps } from '@chakra-ui/react';
import React from 'react';

//
import { SIDEBAR_MENU_ITEMS } from '@/app/constants';
import Button from '@/components/Button';
import { IconProps } from '@/components/Icon';
import { useLocation } from 'react-router-dom';

export interface SidebarProps extends FlexProps {

}

const Sidebar: React.FC<SidebarProps> = ({ ...props }) => {
	const location = useLocation()

	return (
		<Flex {...props}>
			<Flex
				flexDirection={{base: 'row', lg: 'column'}}
				justifyContent={{base: 'space-between', lg: 'unset'}}
				gap={{base: '0.25rem', lg: "2.4rem"}}
				py={{base: '1rem', lg: '2.4rem'}}
				w="full"
			>
				{SIDEBAR_MENU_ITEMS.map((item) => (
					<Button key={`menu-item_${item.id}`} variant="menu" size="menu"
						href={item.path}
						icon={`menu.${item.id}` as IconProps['id']}
						data-active={location.pathname.includes(item.path) ? "" : undefined}
						children={item.label}
					/>
				))}
			</Flex>
		</Flex>
	)
}

export default Sidebar