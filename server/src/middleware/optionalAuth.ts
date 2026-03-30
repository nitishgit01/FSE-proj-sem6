import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User.model';

/**
 * Middleware: Optionally attaches user if a valid JWT cookie exists.
 * Does NOT reject the request if no token is present — allows guests through.
 * Used on routes that work for both guests and logged-in users (e.g. submissions).
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Token invalid or expired — continue as guest
  }

  next();
};
