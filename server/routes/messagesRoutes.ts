import express from 'express'
import { messagesController } from '../app'

export const messagesRoutes = () => {
	const messagesRoutes = express.Router()

	messagesRoutes.get('/:chatroomId', messagesController.getMessages)
	messagesRoutes.get('/chatroom/:userId', messagesController.getChatroomList)
	messagesRoutes.put('/', messagesController.deleteMessage)
	messagesRoutes.put(
		'/chatroom/chatroomName',
		messagesController.editChatroomName
	)
	messagesRoutes.put(
		'/chatroom/participants',
		messagesController.addParticipants
	)
	messagesRoutes.post('/', messagesController.sendMessage)
	messagesRoutes.post('/chatroom', messagesController.createChatroom)
	messagesRoutes.delete('/chatroom', messagesController.exitChatroom)

	return messagesRoutes
}
