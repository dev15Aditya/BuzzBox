import { NextFunction, Request, Response } from "express";
import { AuthService } from "../service/AuthService";


export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
  }

  // Verify token
  const user = await AuthService.verifyToken(token!);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
  }

  // Attach user to request object
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};