import { Request, Response } from 'express'
import { ContactsService } from '../services/contactsServices'

export class ContactsController {
	constructor(private contactsService: ContactsService) {}

	checkUsername = async (req: Request, res: Response) => {
		try {
			const value = req.body.value
			const user = await this.contactsService.checkUsername(value)
			if (user) {
				res.json({
					success: true,
					msg: 'User found',
					userId: user.id
				})
			} else {
				res.json({
					success: false,
					msg: 'User not found, please try again'
				})
			}
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during reading database'
			})
		}
	}

	createContact = async (req: Request, res: Response) => {
		try {
			const nickname = req.body.nickname
			const ownerId = req.body.owner
			const targetId = req.body.user
			const check = await this.contactsService.checkContact(
				ownerId,
				targetId
			)
			if (ownerId === targetId) {
				res.json({
					success: false,
					msg: 'You cannot add yourself to contact'
				})
			} else if (check) {
				res.json({
					success: false,
					msg: 'Contact already existed'
				})
			} else {
				const result = await this.contactsService.createContact(
					ownerId,
					targetId,
					nickname
				)

				if (result) {
					res.json({
						success: true,
						msg: 'Contact created',
						contactId: result.contactId,
						contactUsername: result.contactUsername
					})
				} else {
					res.json({
						success: false,
						msg: 'Failed to create contact, please try again'
					})
				}
			}
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during reading database'
			})
		}
	}

	getContactsList = async (req: Request, res: Response) => {
		try {
			const userId = req.params.userId
			const contactsList = await this.contactsService.getContactsList(
				parseInt(userId)
			)
			if (contactsList) {
				res.json({
					success: true,
					msg: 'Contact List Retrieved',
					contactsList
				})
			} else {
				res.json({
					success: false,
					msg: 'No contacts yet, would you like to add new one?'
				})
			}
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during reading database'
			})
		}
	}

	deleteContact = async (req: Request, res: Response) => {
		try {
			const contactId = req.body.contactId
			await this.contactsService.deleteContact(contactId)

			res.json({
				success: true,
				msg: 'Contact Deleted'
			})
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during deleting contact'
			})
		}
	}

	editContactName = async (req: Request, res: Response) => {
		try {
			const contactId = req.body.contactId
			const editName = req.body.editName

			await this.contactsService.editContactName(contactId, editName)

			res.json({
				success: true,
				msg: 'Contact Edited'
			})
		} catch (e) {
			console.error(e)
			res.status(500).json({
				msg: 'Something Went wrong during editing contact'
			})
		}
	}
}
