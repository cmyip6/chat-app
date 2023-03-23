import { ColorScheme } from '@mantine/core'
import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'

export type NotificationPositions = 'bottom-right' | 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-center'

export type OptionState = {
	colorTheme: ColorScheme
	isStreaming: boolean
	notificationPosition: NotificationPositions
}

const initialState: OptionState = {
	colorTheme: 'light',
	isStreaming: false,
	notificationPosition: 'bottom-right'
}

const toggleColorScheme: CaseReducer<
	OptionState,
	PayloadAction<ColorScheme>
> = (state, action) => {
	state.colorTheme = action.payload
}

const toggleIsStreaming: CaseReducer<
	OptionState,
	PayloadAction<boolean>
> = (state, action) => {
	state.isStreaming = action.payload
}

const setNotificationPosition: CaseReducer<
	OptionState,
	PayloadAction<NotificationPositions>
> = (state, action) => {
	state.notificationPosition = action.payload
}

const optionSlice = createSlice({
	name: 'option',
	initialState,
	reducers: {
		toggleColorScheme,
		toggleIsStreaming,
		setNotificationPosition,
	}
})

export const { 
	toggleColorScheme: toggleColorSchemeAction, 
	toggleIsStreaming: toggleIsStreamingAction,
	setNotificationPosition: setNotificationPositionAction,
} = optionSlice.actions

export default optionSlice.reducer
