import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Extend Express Request so TypeScript knows about req.user.
 * Using { userId: string } keeps middleware lightweight — no DB round-trip here.
 * Controllers that need the full document call User.findById(req.user.userId).
 */
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string };
    }
  }
}

/**
 * Middleware: Requires a valid JWT in the 'wg_token' HttpOnly cookie.
 * Attaches { userId } to req.user on success.
 * Returns 401 on missing or invalid token — no DB lookup performed here.
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.wg_token as string | undefined;

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.',
      },
    });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session. Please log in again.',
      },
    });
    return;
  }

  req.user = { userId: decoded.userId };
  next();
};
