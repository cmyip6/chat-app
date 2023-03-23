import { ColorScheme } from '@mantine/core'
import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'

export type OptionState = {
	colorTheme: ColorScheme
	isStreaming: boolean
}

const initialState: OptionState = {
	colorTheme: 'light',
	isStreaming: false
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

const optionSlice = createSlice({
	name: 'option',
	initialState,
	reducers: {
		toggleColorScheme,
		toggleIsStreaming,
	}
})

export const { 
	toggleColorScheme: toggleColorSchemeAction, 
	toggleIsStreaming: toggleIsStreamingAction,
} = optionSlice.actions

export default optionSlice.reducer
