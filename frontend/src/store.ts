import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import logger from 'redux-logger'
import { io } from 'socket.io-client'
import authReducer, { AuthState } from './redux/auth/slice'
import contactReducer, { ContactState } from './redux/contacts/slice'
import messagesReducer, { MessagesState } from './redux/messages/slice'
import optionReducer, { OptionState } from './redux/option/slice'

export interface IRootState {
	auth: AuthState
	contacts: ContactState
	messages: MessagesState
	option: OptionState
}

const rootReducer = combineReducers({
	auth: authReducer,
	contacts: contactReducer,
	messages: messagesReducer,
	option: optionReducer
})

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ serializableCheck: false }).concat(logger)
})

export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<IRootState> = useSelector
export const PREFIX = 'chat-app-'
export const getState = () => store.getState() //use in Thunk
export const socket = io(`${process.env.REACT_APP_API_SERVER}`)
