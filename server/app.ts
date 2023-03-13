import express from 'express';
import http from 'http';
import {Server as SocketIO, Socket} from 'socket.io';
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
import { socketLogic } from './socket/socketLogic';

dotenv.config();

const knexConfig = require('./knexfile');
const configMode = process.env.NODE_ENV || 'development';
export const knex = Knex(knexConfig[configMode]);

const app = express();
const server = new http.Server(app);
export const io = new SocketIO(server, {cors: {origin: process.env.REACT_APP_DOMAIN}});


export const authService = new AuthService(knex);
export const authController = new AuthController(authService);
export const contactsService = new ContactsService(knex);
export const contactsController = new ContactsController(contactsService);
export const messagesService = new MessagesService(knex);
export const messagesController = new MessagesController(messagesService);

io.on('connection', (socket: Socket) => socketLogic(socket));

app.use(express.json(), cors({origin: `${process.env.REACT_APP_DOMAIN}`}));

app.use('/auth', authRoutes());
app.use('/contacts',isLoggedIn, contactsRoutes());
app.use('/messages',isLoggedIn, messagesRoutes());

const PORT = 8080;

server.listen(PORT, () => {
	console.log(`Listening at http://localhost:${PORT}/`);
});
