import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('contacts', (table) => {
		table.increments()
		table.integer('owner').unsigned()
		table.foreign('owner').references('users.id')
		table.integer('user').unsigned()
		table.foreign('user').references('users.id')
		table.string('nickname')
		table.timestamps(false, true)
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('contacts')
}
