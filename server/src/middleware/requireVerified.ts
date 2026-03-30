import { Request, Response, NextFunction } from 'express';
import { ApiErrorCode } from '../../../shared/types/index';

/**
 * Middleware: Requires the authenticated user to have a verified email.
 * Must be used AFTER requireAuth.
 */
export const requireVerified = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      error: {
        code: ApiErrorCode.EMAIL_NOT_VERIFIED,
        message: 'Please verify your email before accessing this resource.',
      },
    });
    return;
  }

  next();
};
