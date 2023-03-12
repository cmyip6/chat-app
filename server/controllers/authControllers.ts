import { AuthService } from "../services/authServices";
import { Request, Response } from "express";
import jwtSimple from 'jwt-simple';
import jwt from '../jwt';

export class AuthController {
    constructor(private authService: AuthService) { }

    login = async (req: Request, res: Response) => {
        try {
            if (!req.body.username || !req.body.password) {
                res.status(401).json({ msg: "Wrong Username/Password" });
                return;
            }
            const result = await this.authService.login(req.body.username, req.body.password);
            if (result) {
                const token = jwtSimple.encode(result, jwt.jwtSecret);
                res.json({
                    success: true,
                    userId: result.id,
                    username: result.username,
                    token,
                    msg: 'Login Success'
                });
            } else {
                res.status(401).json({
                    success: false,
                    msg: "Wrong Username/Password"
                });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({ msg: "[LOG] Fail to login." });
        }
    }

    signUp = async (req: Request, res: Response) => {
        try {
            if (!req.body.username || !req.body.password) {
                res.status(401).json({ msg: "Missing Username/Password" });
                return;
            }
            const result = await this.authService.signUp(
                req.body.username, 
                req.body.password, 
            )
            if (result) {
                const token = jwtSimple.encode(result, jwt.jwtSecret);
                res.json({
                    success: true,
                    userId: result.id,
                    username: result.username,
                    token,
                    msg: 'Registration Success'
                });
            } else {
                res.status(400).json({
                    success: false,
                    msg: "Username is used, please try another one"
                });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({ msg: "[LOG] Fail to sign up." });
        }
    }

    retrieveLogin = async (req: Request, res: Response) => {
        try {
            const token = req.body.token
            const user = jwtSimple.decode(token, jwt.jwtSecret);
            const result = await this.authService.retrieveUser(user.id, user.username);
            if (result) {
                res.json({
                    success: true,
                    userId: result.id,
                    username: result.username,
                    token,
                    msg: `Welcome Back ${result.username}`
                });
            } else {
                res.status(401).json({
                    success: false,
                    msg: "Invalid Token, please login again."
                });
            }
        } catch (e) {
            console.error(e);
            res.status(500).json({ msg: "[LOG] Fail to Retrieve User Info." });
        }
    }

}