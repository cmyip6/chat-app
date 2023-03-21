import { Knex } from 'knex'
export class ContactsService {
	constructor(private knex: Knex) {}

	async checkUsername(value: string) {
		const txn = await this.knex.transaction()

		try {
			const [user] = await txn
				.select('*')
				.from('users')
				.where('username', value)

			await txn.commit()
			return user
		} catch (e) {
			await txn.rollback()
			throw e
		}
	}

	async getContactsList(userId: number) {
		try {
			const contactList = await this.knex
				.select(
					'contacts.id as contactId',
					'contacts.nickname',
					'users.username as contactUsername'
				)
				.from('contacts')
				.where('owner', userId)
				.join('users', 'users.id', 'contacts.user')

			return contactList
		} catch (e) {
			throw e
		}
	}

	async checkContact(ownerId: number, targetId: number) {
		try {
			const [check] = await this.knex('contacts')
				.where('owner', ownerId)
				.where('user', targetId)

			if (check) {
				return check.id
			}
			return
		} catch (e) {
			throw e
		}
	}
	async deleteContact(contactId: number) {
		try {
			await this.knex('contacts').delete().where('id', contactId)
		} catch (e) {
			throw e
		}
	}

	async editContactName(contactId: number, editName: string) {
		try {
			await this.knex('contacts')
				.update({
					nickname: editName
				})
				.where('id', contactId)
		} catch (e) {
			throw e
		}
	}

	async createContact(ownerId: number, targetId: number, nickname?: string) {
		const txn = await this.knex.transaction()
		try {
			const [{ id }] = await txn('contacts')
				.insert({
					owner: ownerId,
					user: targetId,
					nickname: nickname
				})
				.returning('contacts.id')

			const [{ username }] = await txn
				.select('username')
				.from('users')
				.where('id', targetId)

			await txn.commit()
			return { contactId: id, contactUsername: username }
		} catch (e) {
			await txn.rollback()
			throw e
		}
	}
}
