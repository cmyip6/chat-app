import express from 'express'
import { contactsController } from '../app'

export const contactsRoutes = () => {
	const contactsRoutes = express.Router()

	contactsRoutes.get('/:userId', contactsController.getContactsList)
	contactsRoutes.delete('/', contactsController.deleteContact)
	contactsRoutes.put('/', contactsController.editContactName)
	contactsRoutes.post('/', contactsController.createContact)
	contactsRoutes.post('/username', contactsController.checkUsername)

	return contactsRoutes
}
