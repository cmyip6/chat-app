import { Socket } from 'socket.io'
import { io } from '../app'

type User = {
	username?: string
	userId: number
	socketId: string
}

type Contacts = {
	contactId: number
	nickname: string | undefined
	isOnline?: boolean
	contactUsername: string
}

export type ContactsList = Contacts[]

let userList: User[] = []

export const socketLogic = (socket: Socket) => {

	console.log(socket.id)

	socket.on('callUser', ({chatroomId, signal, initiator, name})=> {
		socket.to(`chatroom-${chatroomId}`).emit('callUserResponse', {chatroomId, signal, initiator, name})
	})

	socket.on('answerCall', ({ signal, chatroomId })=>{
		socket.to(`chatroom-${chatroomId}`).emit('callAccepted', signal)
	})

	socket.on('getOnlineUserList', ({ socketId, contactsList }) => {
		if (userList?.length && contactsList?.length) {
			for (let contact of contactsList) {
				for (let user of userList) {
					if (user.username === contact.contactUsername) {
						contact.isOnline = true
						break
					}
				}
			}
			io.to(socketId).emit('getOnlineUserListResponse', contactsList)
		} else {
			return
		}
	})

	socket.on('joinChatroom', (chatroomList) => {
		for (let chatroom of chatroomList) {
			socket.join(`chatroom-${chatroom.chatroomId}`)
		}
	})

	socket.on('sendMessage', (chatroomId) => {
		io.to(`chatroom-${chatroomId}`).emit('sendMessageResponse', chatroomId)
	})

	socket.on('deleteMessage', ({ messageId, chatroomId }) => {
		io.to(`chatroom-${chatroomId}`).emit('deleteMessageResponse', messageId)
	})

	socket.on('createContact', (data) => {
		for (let user of userList) {
			if (user.username === data.username) {
				io.to(socket.id).emit('loginResponse', data)
				break
			}
		}
	})

	socket.on('createChatroom', (chatroom) => {
		for (let user of chatroom.participants) {
			for (let onlineUser of userList) {
				if (onlineUser.username === user.participantName) {
					io.to(onlineUser.socketId).emit(
						'createChatroomResponse',
						chatroom
					)
				}
			}
		}
	})

	socket.on('toggleParticipantStatus', (data) => {
		io.to(`chatroom-${data.chatroomId}`).emit(
			'toggleParticipantStatusResponse',
			data
		)
	})

	socket.on('typing', (data) => {
		io.to(`chatroom-${data.selectedChatroom}`).emit('typingResponse', data)
	})

	socket.on('login', (user) => {
		console.log(user.username+' just logged in')
		socket.join(`user-${user.userId}`)
		userList.push(user)
		console.log(userList)
		io.emit('loginResponse', user)
	})

	socket.on('logout', (user) => {
		userList = userList.filter((user) => user.socketId !== socket.id)
		console.log(userList)
		io.emit('logoutResponse', user)
	})

	socket.on('disconnect', () => {
		const user = userList.find((user) => user.socketId === socket.id)
		console.log(user)
		if (user) {
			io.emit('logoutResponse', user)
			userList = userList.filter((user) => user.socketId !== socket.id)
		}
	})

	return socketLogic
}
