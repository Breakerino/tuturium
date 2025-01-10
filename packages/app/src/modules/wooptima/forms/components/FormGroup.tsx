//
import { GridProps, Grid } from '@chakra-ui/react';

//
import { extractStyledProps } from '@/modules/wooptima/chakra-extended';

interface FormGroupProps extends GridProps {
	children: React.ReactElement | React.ReactElement[];
}

const FormGroup: React.FC<FormGroupProps> = ({ children, ...props }) => {
	const { styles: styleProps, ...componentProps } = extractStyledProps(props);

	return (
		<Grid as="fieldset" sx={{
			width: 'full',
			rowGap: 'var(--form-row-gap)',
			columnGap: 'var(--form-column-gap)',
			gridAutoColumns: 'auto',
			p: 0,
			m: 0,
			border: 'none',
			gridTemplateColumns: 'repeat(auto-fill, minmax(calc(100% / 12 - var(--form-column-gap)), 1fr))',
			...styleProps
		}} {...componentProps}>
			{children}
		</Grid>
	)
}

export default FormGroup;