import express from 'express';
import dotenv from 'dotenv';
import Knex from 'knex';
import cors from 'cors';
import { AuthService } from './services/authServices';
import { AuthController } from './controllers/authControllers';
import { authRoutes } from './routes/authRoutes';
import { ContactsService } from './services/contactsServices';
import { ContactsController } from './controllers/contactsControllers';
import { isLoggedIn } from './guard';
import { contactsRoutes } from './routes/contactsRoutes';
import { MessagesService } from './services/messagesServices';
import { MessagesController } from './controllers/messagesControllers';
import { messagesRoutes } from './routes/messagesRoutes';

dotenv.config();

const knexConfig = require('./knexfile');
const configMode = process.env.NODE_ENV || 'development';
export const knex = Knex(knexConfig[configMode]);

const app = express();

export const authService = new AuthService(knex);
export const authController = new AuthController(authService);
export const contactsService = new ContactsService(knex);
export const contactsController = new ContactsController(contactsService);
export const messagesService = new MessagesService(knex);
export const messagesController = new MessagesController(messagesService);


app.use(express.json(), cors());

app.use('/auth', authRoutes());
app.use('/contacts',isLoggedIn, contactsRoutes());
app.use('/messages',isLoggedIn, messagesRoutes());

const PORT = 8080;

app.listen(PORT, () => {
	console.log(`Listening at http://localhost:${PORT}/`);
});
