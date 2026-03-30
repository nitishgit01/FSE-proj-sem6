import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User, IUserDocument } from '../models/User.model';
import { ApiErrorCode } from '../../../shared/types/index';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

/**
 * Middleware: Requires a valid JWT in HttpOnly cookie.
 * Attaches the user document to req.user.
 * Returns 401 if no token or invalid token.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: ApiErrorCode.UNAUTHORIZED,
          message: 'Authentication required. Please log in.',
        },
      });
      return;
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: ApiErrorCode.UNAUTHORIZED,
          message: 'User not found. Please log in again.',
        },
      });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: {
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Invalid or expired token. Please log in again.',
      },
    });
  }
};
