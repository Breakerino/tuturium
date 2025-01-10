import { isStyleProp, SystemStyleObject } from '@chakra-ui/react';
import { mergeWith } from 'lodash';

export const extractStyledProps = <T extends Record<string, any>>(props: T) => {
	const styles = {};
	const rest = {};

	// @ts-ignore
	Object.keys(props).forEach((key) => {
		if (isStyleProp(key)) {
			// @ts-ignore
			styles[key] = props[key];
		} else {
			// @ts-ignore
			rest[key] = props[key];
		}
	});

	return { styles, ...rest } as { styles: SystemStyleObject } & T;
};

export const cssImportant = (value: string | number) => `${value} !important`;

// @ts-ignore
export function omitThemeDefaultGlobalStyles(theme, styles = {}) {
	theme.styles.global = styles ?? {};
}

// @ts-ignore
export function convertThemeTokensUnits(theme, unitFrom, unitTo) {
	const regex = new RegExp(`(\\d*\\.?\\d+)(${unitFrom})`, 'g');

	for (const token of ['fontSizes', 'lineHeights', 'letterSpacings', 'sizes', 'space', 'radii', 'breakpoints']) {
		for (const [key, value] of Object.entries(theme[token]) as any) {
			theme[token][key] = value?.replace?.(regex, `$1${unitTo}`);
		}
	}
}

export function mergeStyles(themeStyles: Record<string, any>, propStyles: Record<string, any>): any {
  return mergeWith(themeStyles, propStyles, (objValue, srcValue) => {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
}