import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../service/AuthService';

// Add interface to extend Request with user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized - No token provided' });
      return;
    }

    // Check for Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Invalid token format' });
      return;
    }

    // Verify token
    const user = await AuthService.verifyToken(authHeader);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized - Invalid token' });
      return;
    }

    // Attach user to request object
    req.user = user;
    return next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
