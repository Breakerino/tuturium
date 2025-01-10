import { ThemeExtension, withDefaultColorScheme } from "@chakra-ui/react";

const extensions: ThemeExtension[] = [
	withDefaultColorScheme({
		colorScheme: 'primary',
		components: ['Button', 'Radio'],
	})
]

export default extensions;