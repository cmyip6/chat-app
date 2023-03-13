import express from "express";
import { messagesController } from "../app";

export const messagesRoutes = () => {
   const messagesRoutes = express.Router();

   messagesRoutes.get('/:chatroomId', messagesController.getMessages);
   messagesRoutes.get('/chatroom/:userId', messagesController.getChatroomList)
   messagesRoutes.put('/chatroom', messagesController.editChatroomName)
   messagesRoutes.post('/chatroom', messagesController.createChatroom);
   messagesRoutes.post('/', messagesController.sendMessage);
   messagesRoutes.delete('/chatroom', messagesController.exitChatroom);

   
   return messagesRoutes;
}