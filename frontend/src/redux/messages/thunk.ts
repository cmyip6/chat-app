import { showNotification } from '@mantine/notifications'
import { Dispatch } from '@reduxjs/toolkit'
import { getState, socket } from '../../store'
import { MakeRequest } from '../../utils/requestUtils'
import {
	addMemberAction,
	ChatroomList,
	createChatroomAction,
	deleteMessageAction,
	editChatroomNameAction,
	exitChatroomAction,
	getChatroomListAction,
	getMessagesAction,
	MessageList,
	sendMessageAction,
	setSelectedChatroomAction
} from './slice'

const makeRequest = (token: string) => new MakeRequest(token)

export function addMember(nameList: string[], chatroomId: number) {
	return async (dispatch: Dispatch) => {
		const token = getState().auth.token
		const userId = getState().auth.userId!

		const result = await makeRequest(token!).put<
			{
				nameList: string[]
				chatroomId: number
				userId: number
			},
			{
				success: boolean
				chatroomList: ChatroomList
				msg: string
			}
		>(`/messages/chatroom/participants`, {
			nameList,
			chatroomId,
			userId
		})

		if (result.success) {
			const chatroom = result.chatroomList.find(
				(chatroom) => chatroom.chatroomId === chatroomId
			)
			const participantList = chatroom?.participants!
			dispatch(addMemberAction({ chatroomId, participantList }))
			socket.emit('createChatroom', chatroom)
		}
		showNotification({
			title: 'Update Participants Notification',
			message: result.msg,
			autoClose: 2000
		})
	}
}

export function createChatroom(nameList: string[], chatroomName?: string) {
	return async (dispatch: Dispatch) => {
		const token = getState().auth.token
		const owner = getState().auth.userId!
		const self = getState().auth.username
		const fullNameList = nameList.concat([self!])

		const result = await makeRequest(token!).post<
			{
				fullNameList: string[]
				owner: number
				chatroomName?: string
			},
			{
				success?: boolean
				chatroomId?: number
				isGroup: boolean
				participants: {
					participantName: string
					participantNickname?: string
					participantId: number
					participationId: number
					isDeleted: boolean
				}[]
				msg: string
			}
		>(`/messages/chatroom`, {
			fullNameList,
			owner,
			chatroomName
		})

		if (result.msg === 'Chatroom Existed') {
			dispatch(setSelectedChatroomAction(result.chatroomId!))
			socket.emit('toggleParticipantStatus', {
				chatroomId: result.chatroomId,
				participantId: owner,
				isDeleted: false
			})
		} else if (result.success) {
			const payload = {
				chatroomId: result.chatroomId!,
				chatroomName: chatroomName!,
				chatroomOwner: owner,
				ownerName: self!,
				isGroup: result.isGroup,
				participants: result.participants,
				messageList: []
			}
			dispatch(createChatroomAction(payload))
			dispatch(setSelectedChatroomAction(result.chatroomId!))

			socket.emit('createChatroom', payload)
		}
	}
}

export function deleteMessage(messageId: number, userId: number) {
	return async (dispatch: Dispatch) => {
		const token = getState().auth.token
		const chatroomId = getState().messages.selectedChatroom

		const result = await makeRequest(token!).put<
			{
				userId: number
				messageId: number
			},
			{
				success: boolean
				data: {
					id: number
					content: string
					is_deleted: boolean
					created_at: string
					sender_username: string
				}

				msg: string
			}
		>(`/messages/`, {
			userId,
			messageId
		})

		if (result.success) {
			socket.emit('deleteMessage', { messageId, chatroomId })

			dispatch(deleteMessageAction(messageId))
		}
	}
}

export function sendMessage(
	userId: number,
	selectedChatroom: number,
	text: string
) {
	return async (dispatch: Dispatch) => {
		const token = getState().auth.token

		const result = await makeRequest(token!).post<
			{
				userId: number
				selectedChatroom: number
				text: string
			},
			{
				success: boolean
				data: {
					id: number
					content: string
					is_deleted: boolean
					created_at: string
					sender_username: string
				}

				msg: string
			}
		>(`/messages/`, {
			userId,
			selectedChatroom,
			text
		})

		if (result.success) {
			socket.emit('sendMessage', selectedChatroom)

			console.log(result)
			const payload = {
				messageId: result.data.id,
				senderId: userId,
				senderUsername: result.data.sender_username,
				content: text,
				isDeleted: false,
				isSystemMessage: false,
				createdAt: result.data.created_at
			}

			dispatch(
				sendMessageAction({
					message: payload,
					chatroomId: selectedChatroom
				})
			)
		}
	}
}

export function getMessages(chatroomId: number) {
	return async (dispatch: Dispatch) => {
		const token = getState().auth.token
		const result = await makeRequest(token!).get<{
			success?: boolean
			messageList: MessageList
			msg: string
		}>(`/messages/${chatroomId}`)

		if (result.success) {
			dispatch(
				getMessagesAction({
					messageList: result.messageList,
					chatroomId
				})
			)
			console.log(result.msg)
		} else {
			showNotification({
				title: 'Get Message List Notification',
				message: result.msg
			})
		}
	}
}

export function getChatroomList(userId: number) {
	return async (dispatch: Dispatch) => {
		const token = getState().auth.token
		const result = await makeRequest(token!).get<{
			success?: boolean
			chatroomList: ChatroomList
			msg: string
		}>(`/messages/chatroom/${userId}`)

		if (result.success) {
			dispatch(getChatroomListAction(result.chatroomList))
			if (result.chatroomList?.length) {
				socket.emit('joinChatroom', result.chatroomList)
			}
		} else {
			showNotification({
				title: 'Get Contact List Notification',
				message: result.msg
			})
		}
	}
}

export function editChatroomName(chatroomId: number, chatroomName: string) {
	return async (dispatch: Dispatch) => {
		const token = getState().auth.token
		const userId = getState().auth.userId!
		const result = await makeRequest(token!).put<
			{
				chatroomId: number
				chatroomName: string
				userId: number
			},
			{
				success?: boolean
				msg: string
			}
		>(`/messages/chatroom/chatroomName`, {
			chatroomId,
			chatroomName,
			userId
		})

		if (result.success) {
			const payload = {
				chatroomId,
				chatroomName
			}
			dispatch(editChatroomNameAction(payload))
			socket.emit('sendMessage', chatroomId)
			console.log(result.msg)
		} else {
			showNotification({
				title: 'Edit Chatroom Name Notification',
				message: result.msg
			})
		}
	}
}

export function exitChatroom(chatroomId: number, participantId: number) {
	return async (dispatch: Dispatch) => {
		const token = getState().auth.token
		const result = await makeRequest(token!).delete<
			{
				chatroomId: number
				participantId: number
			},
			{
				success?: boolean
				msg: string
			}
		>(`/messages/chatroom`, { chatroomId, participantId })

		if (result.success) {
			socket.emit('toggleParticipantStatus', {
				chatroomId,
				participantId,
				isDeleted: true
			})
			dispatch(exitChatroomAction(chatroomId))
			const chatroomList = getState().messages.chatroomList
			chatroomList &&
				dispatch(setSelectedChatroomAction(chatroomList[0].chatroomId))
		}
		showNotification({
			title: 'Exit Chatroom Notification',
			message: result.msg
		})
	}
}
