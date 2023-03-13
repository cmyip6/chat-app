import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('messages', (table) => {
		table.boolean('system_message').defaultTo(false).notNullable();
	});
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('messages', (table) => {
		table.dropColumn('system_message')
	});
}
