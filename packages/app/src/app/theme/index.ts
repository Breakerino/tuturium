//
import { extendTheme } from '@chakra-ui/react';

// Theme extensions
import colors from './colors';
import components from './components';
import extensions from './extensions';
import general from './general';

const theme = extendTheme({ // TODO: extendBaseTheme
	...general,
	colors,
	components,
}, ...extensions);

export default theme;