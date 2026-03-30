import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { setTokenCookie, clearTokenCookie } from '../utils/jwt';

// ── Validation Schemas ────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

// ── Controllers ───────────────────────────────────────────

/**
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = registerSchema.parse(req.body);
    const { user, token } = await authService.register(body.email, body.password);

    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        message: 'Account created. Please check your email to verify your account.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = loginSchema.parse(req.body);
    const { user, token } = await authService.login(body.email, body.password);

    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully.' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/verify/:token
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.verifyEmail(req.params.token);
    const jwtToken = (await import('../utils/jwt')).signToken(user._id.toString());

    setTokenCookie(res, jwtToken);

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        message: 'Your email has been verified. You are now logged in.',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-verification
 */
export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await authService.resendVerification(email);

    // Always return success (don't reveal if email exists)
    res.status(200).json({
      success: true,
      data: { message: 'If this email is registered, a verification link has been sent.' },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const profile = await authService.getProfile(req.user!._id.toString());

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
