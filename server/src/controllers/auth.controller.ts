import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { setTokenCookie, clearTokenCookie } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { blacklistToken } from '../utils/tokenBlacklist';

// ─── Validation Schemas ────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('A valid email address is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const loginSchema = z.object({
  email:    z.string().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

const emailSchema = z.object({
  email: z.string().email('A valid email address is required'),
});

// ─── Controllers ───────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * Registers a new user. No auto-login — user must verify email first.
 * Generic 409 message prevents email enumeration.
 */
export const register = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { email, password } = registerSchema.parse(req.body);

  await authService.register(email, password);

  res.status(201).json({
    success: true,
    data: {
      message: 'Check your email to verify your account.',
    },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { email, password } = loginSchema.parse(req.body);

  const { user, token } = await authService.login(email, password);

  setTokenCookie(res, token);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

/**
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  // Invalidate the JWT server-side so it can't be replayed
  const token = req.cookies?.wg_token as string | undefined;
  if (token) blacklistToken(token);

  clearTokenCookie(res);

  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully.' },
  });
});

/**
 * GET /api/auth/verify/:token
 * Auto-logs in user after verification by setting the JWT cookie.
 */
export const verifyEmail = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { token: rawToken } = req.params;

  const { user, jwtToken } = await authService.verifyEmail(rawToken);

  setTokenCookie(res, jwtToken);

  res.status(200).json({
    success: true,
    data: {
      user,
      message: 'Email verified. You are now logged in.',
    },
  });
});

/**
 * POST /api/auth/resend-verification
 * Anti-enumeration: always returns 200 success regardless of whether the email exists.
 */
export const resendVerification = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { email } = emailSchema.parse(req.body);

  await authService.resendVerification(email);

  res.status(200).json({
    success: true,
    data: {
      message: 'If this email is registered and unverified, a new link has been sent.',
    },
  });
});

/**
 * GET /api/auth/me
 * Returns the safe AuthUser profile for the authenticated user.
 */
export const getMe = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const userId = req.user!.userId;

  const user = await authService.getProfile(userId);

  res.status(200).json({
    success: true,
    data: { user },
  });
});
