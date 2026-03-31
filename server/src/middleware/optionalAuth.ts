import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Middleware: Optionally attaches { userId } to req.user if a valid
 * 'wg_token' cookie is present. Never rejects the request — guests pass through.
 *
 * Used on routes that work for both authenticated users and guests
 * (e.g. salary stats, submission creation by guests).
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.wg_token as string | undefined;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = { userId: decoded.userId };
    }
  }

  // Always call next — no DB lookup, no async, instant
  next();
};
