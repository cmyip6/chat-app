import express from "express";
import { authController } from "../app";

export const authRoutes = () => {
   const authRoutes = express.Router();

   authRoutes.post('/', authController.login);
   authRoutes.post('/registration', authController.signUp);
   authRoutes.post('/retrieveLogin', authController.retrieveLogin);

   return authRoutes;
}