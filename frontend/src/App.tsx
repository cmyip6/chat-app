import {
	ColorScheme,
	ColorSchemeProvider,
	MantineProvider,
	MantineThemeOverride
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import Home from './components/pages/Home'
import Login from './components/pages/Login'
import { retrieveLogin } from './redux/auth/thunk'
import { PREFIX, useAppDispatch, useAppSelector } from './store'

function App() {
	const dispatch = useAppDispatch()
	const login = useAppSelector((state) => state.auth.isLoggedIn)
	const position = useAppSelector((state) => state.option.notificationPosition)

	const token = localStorage.getItem(`${PREFIX}token`)
	const [colorScheme, setColorScheme] = useState<ColorScheme>('light')
	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

	useEffect(() => {
		if (token && !login) {
			dispatch(retrieveLogin(token))
		}
	}, [])

	const myTheme: MantineThemeOverride = useMemo(() => {
		return {
			colorScheme: colorScheme,
			primaryColor: 'orange',
			defaultRadius: 0
		}
	}, [colorScheme])

	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}
		>
			<MantineProvider withNormalizeCSS withGlobalStyles theme={myTheme}>
				{!login ? <Login /> : <Home />}
				<Notifications position={position} />
			</MantineProvider>
		</ColorSchemeProvider>
	)
}

export default App
