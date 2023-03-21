import { ColorScheme } from '@mantine/core'
import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit'

export type OptionState = {
	colorTheme: ColorScheme
}

const initialState: OptionState = {
	colorTheme: 'light'
}

const toggleColorScheme: CaseReducer<
	OptionState,
	PayloadAction<ColorScheme>
> = (state, action) => {
	state.colorTheme = action.payload
}

const optionSlice = createSlice({
	name: 'option',
	initialState,
	reducers: {
		toggleColorScheme
	}
})

export const { toggleColorScheme: toggleColorSchemeAction } =
	optionSlice.actions

export default optionSlice.reducer
