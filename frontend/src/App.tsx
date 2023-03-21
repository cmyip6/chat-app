import {
	ColorScheme,
	ColorSchemeProvider,
	MantineProvider,
	MantineThemeOverride
} from '@mantine/core'
import { useEffect, useState } from 'react'
import './App.css'
import Home from './components/Home'
import Login from './components/Login'
import { retrieveLogin } from './redux/auth/thunk'
import { PREFIX, useAppDispatch, useAppSelector } from './store'

function App() {
	const dispatch = useAppDispatch()
	const login = useAppSelector((state) => state.auth.isLoggedIn)

	const token = localStorage.getItem(`${PREFIX}token`)
	const [colorScheme, setColorScheme] = useState<ColorScheme>('light')
	const toggleColorScheme = (value?: ColorScheme) =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

	useEffect(() => {
		if (token && !login) {
			dispatch(retrieveLogin(token))
		}
	}, [])

	const myTheme: MantineThemeOverride = {
		colorScheme: colorScheme,
		primaryColor: 'orange',
		defaultRadius: 0
	}

	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}
		>
			<MantineProvider withNormalizeCSS withGlobalStyles theme={myTheme}>
				{!login ? <Login /> : <Home />}
			</MantineProvider>
		</ColorSchemeProvider>
	)
}

export default App
