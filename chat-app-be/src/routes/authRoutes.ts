import { Router } from "express";
import { AuthController } from "../controller/authController";

const routes = Router();
const authController = new AuthController();

routes.post('/login', authController.login)
routes.post('/register', authController.register)
routes.get('/users', authController.getAllUsers)

export default routes