import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('participation', (table) => {
		table.increments();
		table.integer('user_id').unsigned().notNullable();
        table.foreign('user_id').references('users.id')
		table.integer('chatroom_id').unsigned().notNullable();
        table.foreign('chatroom_id').references('chatrooms.id')
		table.timestamps(false, true);
	});
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('participation');
}