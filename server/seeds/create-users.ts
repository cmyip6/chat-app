import { Knex } from "knex";
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
    await knex("users").del();
    await knex("users").insert([
        { username:"frankie", password: bcrypt.hashSync('test', 10) },
        { username:"irisyu", password: bcrypt.hashSync('test', 10) },
        { username:"mickey", password: bcrypt.hashSync('test', 10) },
        { username:"minnie", password: bcrypt.hashSync('test', 10) },
        { username:"wonderwoman", password: bcrypt.hashSync('test', 10) },
    ]);
};
