import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.alterTable('chatrooms', (table) => {
		table.boolean('group').defaultTo(true).notNullable();
	});
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('chatrooms', (table) => {
		table.dropColumn('group')
	});
}

