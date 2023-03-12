import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('chatrooms', (table) => {
		table.increments();
		table.integer('owner').unsigned().notNullable();
        table.foreign('owner').references('users.id')
		table.string('name')
		table.timestamps(false, true);
	});
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('chatrooms');
}

