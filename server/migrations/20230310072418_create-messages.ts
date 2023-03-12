import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('messages', (table) => {
		table.increments();
		table.integer('chatroom_id').unsigned().notNullable();
        table.foreign('chatroom_id').references('chatrooms.id')
        table.integer('sender').unsigned().notNullable();
        table.foreign('sender').references('users.id')
        table.string('content').notNullable()
        table.boolean('is_deleted').notNullable().defaultTo(false)
		table.timestamps(false, true);
	});
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('messages');
}