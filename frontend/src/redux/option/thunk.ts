import { Dispatch } from '@reduxjs/toolkit'
import { showNotification } from '@mantine/notifications'
import { ColorScheme } from '@mantine/core'
import { PREFIX } from '../../store'
import { toggleColorSchemeAction } from './slice'

export function toggleColorTheme(colorTheme: ColorScheme) {
	return async (dispatch: Dispatch) => {
		window.localStorage.setItem(`${PREFIX}colorTheme`, colorTheme)
		dispatch(toggleColorSchemeAction(colorTheme))
		showNotification({
			title: 'Color Theme Message',
			message: `Theme changed to ${colorTheme} mode`,
			autoClose: 2000
		})
	}
}
