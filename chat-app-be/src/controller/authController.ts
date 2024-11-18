import { Request, Response } from "express";
import { AuthService } from "../service/AuthService";

export class AuthController {
    // login
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                res.status(400).json({ error: "Username and password are required" });
                return;
            }

            const { user, token } = await AuthService.login(username, password);
            res.status(200).json({
                message: "Login successful",
                user,
                token,
            });
        } catch (error) {
            res.status(401).json({
                error: "Login failed",
                message: error,
            });
        }
    }

    // register
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { username, phone, password } = req.body;
            
            if (!username || !phone || !password) {
                res.status(400).json({ error: "Username, phone and password are required" });
                return;
            }
            
            const { user, token } = await AuthService.register(username, phone, password);

            res.status(200).json({
                message: "Login successful",
                user,
                token,
            });
        } catch (error) {
            res.status(401).json({
                error: "Registeration failed",
                message: error,
            });
        }
    }

    // get all users
    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try{
            const users = await AuthService.getAllUsers();
            if(!users) {
                res.status(404).json({ error: "No users found" });
                return;
            }

            res.status(200).json({
                message: "Users fetched successfully",
                users,
            })
        } catch (error) {
            res.status(500).json({
                error: "Failed to get users",
                message: error,
            });
        }
    }
}