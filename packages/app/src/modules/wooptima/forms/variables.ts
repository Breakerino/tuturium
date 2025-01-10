import { cssVar } from '@chakra-ui/react'

export const $input = {
	iconSize: cssVar("input-icon-size"),
	fontSize: cssVar("input-font-size"),
	height: cssVar("input-height"),
	paddingX: cssVar("input-padding-x"),
	paddingY: cssVar("input-padding-y"),
	paddingIcon: cssVar("input-padding-icon"),
	background: cssVar("input-background"),
	borderRadius: cssVar("input-border-radius"),
	borderWidth: cssVar("input-border-width"),
	borderColor: cssVar("input-border-color")
}

export const $select = {
	menu: {
		height: cssVar("select-menu-height")
	},
	option: {
		height: cssVar("select-option-height")
	},
	spinner: {
		size: cssVar("select-spinner-size")
	}
}