import {
	Box,
	Center,
	ColorScheme,
	ColorSwatch,
	Container,
	Group,
	SegmentedControl,
	Title,
	useMantineColorScheme,
	useMantineTheme
} from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { useEffect, useMemo } from 'react'
import { PREFIX } from '../../store'

export default function ThemeControl() {
	const savedColor = window.localStorage.getItem(`${PREFIX}themeColor`)
	const { colorScheme, toggleColorScheme } = useMantineColorScheme()
	const theme = useMantineTheme()
	const swatches = useMemo(() => {
		return Object.keys(theme.colors).map((color) => (
			<ColorSwatch key={color} color={theme.colors[color][6]} />
		))
	}, [theme.colors])

	useEffect(() => {
		savedColor && toggleColorScheme(savedColor as ColorScheme)
	}, [])

	function handleToggleColorScheme(value: ColorScheme) {
		window.localStorage.setItem(`${PREFIX}themeColor`, value)
		toggleColorScheme(value)
	}

	return (
		<Container className='col-6 d-flex flex-column text-center'>
			<Title order={5}>Theme Control</Title>
			<Group position='center' my='md'>
				<SegmentedControl
					value={colorScheme}
					onChange={(value: 'light' | 'dark') =>
						handleToggleColorScheme(value)
					}
					data={[
						{
							value: 'light',
							label: (
								<Center>
									<IconSun size='1rem' stroke={1.5} />
									<Box ml={10}>Light</Box>
								</Center>
							)
						},
						{
							value: 'dark',
							label: (
								<Center>
									<IconMoon size='1rem' stroke={1.5} />
									<Box ml={10}>Dark</Box>
								</Center>
							)
						}
					]}
				/>
			</Group>

			<Group position='center' spacing='xs'>
				{swatches}
			</Group>
		</Container>
	)
}
