import { Dispatch } from '@reduxjs/toolkit'
import { showNotification } from '@mantine/notifications'
import { getState, PREFIX, socket } from '../../store'
import { loginAction, logoutAction } from './slice'
import { clearContactsListAction } from '../contacts/slice'
import { clearChatroomListAction } from '../messages/slice'

export function login(username: string, password: string) {
	return async (dispatch: Dispatch) => {
		const res = await fetch(`${process.env.REACT_APP_API_SERVER}/auth`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username,
				password
			})
		})

		const result = await res.json()
		if (result.success) {
			const payload = {
				userId: result.userId,
				username: result.username,
				token: result.token
			}
			localStorage.setItem(`${PREFIX}token`, result.token)
			socket.emit('login', {
				username: result.username,
				userId: result.userId,
				socketId: socket.id
			})

			dispatch(loginAction(payload))
		} else {
			dispatch(logoutAction())
		}

		showNotification({
			title: 'Login notification',
			message: result.msg,
			autoClose: 2000
		})
	}
}

export function signUp(username: string, password: string) {
	return async (dispatch: Dispatch) => {
		const res = await fetch(
			`${process.env.REACT_APP_API_SERVER}/auth/registration`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username,
					password
				})
			}
		)

		const result = await res.json()
		if (result.success) {
			const payload = {
				userId: result.userId,
				username: result.username,
				token: result.token
			}
			localStorage.setItem(`${PREFIX}token`, result.token)
			dispatch(loginAction(payload))
		} else {
			logout()
			showNotification({
				title: 'Login notification',
				message: result.msg,
				autoClose: 2000
			})
		}
	}
}

export function logout() {
	return async (dispatch: Dispatch) => {
		const userId = getState().auth.userId
		const username = getState().auth.username
		localStorage.removeItem(`${PREFIX}token`)
		dispatch(logoutAction())
		dispatch(clearContactsListAction())
		dispatch(clearChatroomListAction())
		socket.emit('logout', {
			userId,
			username,
			socketId: socket.id
		})
	}
}

export function retrieveLogin(token: string) {
	return async (dispatch: Dispatch) => {
		const res = await fetch(
			`${process.env.REACT_APP_API_SERVER}/auth/retrieveLogin`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					token
				})
			}
		)
		const result = await res.json()

		if (result.success) {
			const payload = {
				userId: result.userId,
				username: result.username,
				token
			}
			dispatch(loginAction(payload))

			socket.emit('login', {
				username: result.username,
				userId: result.userId,
				socketId: socket.id
			})
		} else {
			logout()
		}
		showNotification({
			title: 'Login notification',
			message: result.msg,
			autoClose: 2000
		})
	}
}
