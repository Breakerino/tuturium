//
import React from 'react';
import { Flex, FlexProps, Image, Menu, MenuButton, MenuGroup, MenuItem, MenuList, Text } from '@chakra-ui/react';

//
import Logo from '/assets/icons/logo.svg';
import { useUserContext } from '@/contexts/UserContext';
import Button from '@/components/Button';
import { useNavigate } from 'react-router-dom';

//

export interface HeaderProps extends FlexProps {

}

const Header: React.FC<HeaderProps> = ({ ...props }) => {
	const user = useUserContext();
	const navigate = useNavigate();

	return (
		<Flex {...props}
			px={{
				base: "mobile.spacing.content.x",
				lg: "desktop.spacing.content.x"
			}}
			py="spacing.header.y"
			gap="2rem"
			justifyContent="space-between"
			alignItems="center"
		>
			<Flex>
				<Image src={Logo} width="auto" height="4.8rem" />
			</Flex>

			<Flex>
				{user.store.isLoggedIn && (
					<Flex alignItems="center" gap="1rem">
						<Menu>
							<MenuButton as={Button} variant="circle-icon" color="white" fontSize="2.4rem" lineHeight={1} sx={{ 'span': { mb: '-0.5rem' } }}>
								{user.store.username.charAt(0).toUpperCase()}
							</MenuButton>
							<MenuList>
								<MenuGroup title='Profile'>
									<MenuItem onClick={() => navigate('/profile/settings')}>Settings</MenuItem>
									<MenuItem onClick={user.actions.logout}>Logout</MenuItem>
								</MenuGroup>
							</MenuList>
						</Menu>

						<Text as="span" display={{base: 'none', md: 'inline'}} color="purple.100" fontSize="1.8rem" textTransform="capitalize">{user.store.username}</Text>
					</Flex>
				)}
			</Flex>
		</Flex>
	)
}

export default Header