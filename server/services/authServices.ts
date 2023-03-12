import { Knex } from "knex";
import bcrypt from "bcryptjs";

export class AuthService {
    constructor(private knex: Knex) { }

    async login(username: string, password: string) {
        const [user] = await this.knex("users").where("username", username);
        const check = bcrypt.compareSync(password, user.password);
        if (check) {
            delete user.password;
            return user;
        }
    }

    async retrieveUser(id: number, username: string) {
        const [user] = await this.knex("users")
            .where("username", username)
            .where('id', id)
        return user;
    }

    async signUp(username: string, password: string) {
        const [user] = await this.knex("users").where("username", username);
        if (!user) {
            const txn = await this.knex.transaction();
            try {
                const hashedPassword = bcrypt.hashSync(password, 10);
                const [ user ] = await txn("users").insert({
                    username: username,
                    password: hashedPassword,
                }).returning('*');

                delete user.password

                await txn.commit();
                return user;

            } catch (e) {
                await txn.rollback();
                throw e;
            }
        }
        return;
    }

    async getUser(id: number) {
		const [user] = await this.knex('users').where('id', id);
		if (user) {
			delete user.password;
			return user;
		} else {
			return;
		}
	}
}