import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';
import { ApiErrorCode } from '../../../shared/types/index';

/**
 * Middleware: Requires the authenticated user (from requireAuth) to have
 * a verified email. Performs a DB lookup to get the current isVerified flag.
 *
 * Must be placed AFTER requireAuth in the middleware chain.
 */
export const requireVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Authentication required.',
      },
    });
    return;
  }

  const user = await User.findById(req.user.userId).select('isVerified');

  if (!user || !user.isVerified) {
    res.status(403).json({
      success: false,
      error: {
        code: ApiErrorCode.EMAIL_NOT_VERIFIED,
        message: 'Please verify your email address before accessing this resource.',
      },
    });
    return;
  }

  next();
};
