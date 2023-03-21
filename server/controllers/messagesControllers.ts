import { Request, Response } from 'express'
import { MessagesService } from '../services/messagesServices'

export class MessagesController {
	constructor(private messagesService: MessagesService) {}

	editChatroomName = async (req: Request, res: Response) => {
		try {
			const chatroomId = req.body.chatroomId
			const userId = req.body.userId
			const chatroomName = req.body.chatroomName

			await this.messagesService.editChatroomName(
				chatroomId,
				chatroomName,
				userId
			)

			res.json({
				success: true,
				msg: 'Chatroom Name Updated'
			})
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during updating database'
			})
		}
	}

	exitChatroom = async (req: Request, res: Response) => {
		try {
			const chatroomId = req.body.chatroomId
			const participantId = req.body.participantId

			await this.messagesService.exitChatroom(chatroomId, participantId)

			res.json({
				success: true,
				msg: 'Chatroom Quitted'
			})
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during updating database'
			})
		}
	}

	createChatroom = async (req: Request, res: Response) => {
		try {
			const nameList = req.body.fullNameList
			const ownerId = req.body.owner
			const chatroomName = req.body.chatroomName
			const isGroup = nameList.length > 2

			if (nameList.length === 2) {
				const checkExistingRoomId =
					await this.messagesService.checkChatroom(nameList)
				if (checkExistingRoomId) {
					res.json({
						msg: 'Chatroom Existed',
						chatroomId: checkExistingRoomId,
						isGroup
					})
					return
				}
			}

			const result = await this.messagesService.createChatroom(
				nameList,
				ownerId,
				chatroomName,
				isGroup
			)

			res.json({
				success: true,
				msg: 'Chatroom Created',
				chatroomId: result.chatroomId,
				participants: result.participants,
				isGroup
			})
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during reading database'
			})
		}
	}

	getChatroomList = async (req: Request, res: Response) => {
		try {
			const userId = req.params.userId
			const result = await this.messagesService.getChatroomList(
				parseInt(userId)
			)

			res.json({
				success: true,
				msg: 'Chatroom List Retrieved',
				chatroomList: result
			})
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during reading database'
			})
		}
	}

	getMessages = async (req: Request, res: Response) => {
		try {
			const chatroomId = req.params.chatroomId
			const result = await this.messagesService.getMessages(
				parseInt(chatroomId)
			)

			res.json({
				success: true,
				msg: 'Messages List Retrieved',
				messageList: result
			})
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during reading database'
			})
		}
	}

	sendMessage = async (req: Request, res: Response) => {
		try {
			const userId = req.body.userId
			const chatroomId = req.body.selectedChatroom
			const text = req.body.text

			const message = await this.messagesService.sendMessage(
				userId,
				chatroomId,
				text
			)

			res.json({
				success: true,
				msg: 'Message Created',
				data: message
			})
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during creating new message'
			})
		}
	}

	deleteMessage = async (req: Request, res: Response) => {
		try {
			const userId = req.body.userId
			const messageId = req.body.messageId

			const check = await this.messagesService.deleteMessage(
				userId,
				messageId
			)

			if (check) {
				res.json({
					success: true,
					msg: 'Message Deleted'
				})
			} else {
				res.json({
					success: false,
					msg: 'Only sender can delete message'
				})
			}
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during deleting message'
			})
		}
	}
}
