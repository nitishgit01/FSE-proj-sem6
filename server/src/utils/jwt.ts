import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

const COOKIE_NAME = 'wg_token';

/**
 * Parse a duration string like '7d', '24h', '60m' into seconds.
 */
const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60; // default 7 days
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'd': return value * 24 * 60 * 60;
    case 'h': return value * 60 * 60;
    case 'm': return value * 60;
    case 's': return value;
    default:  return 7 * 24 * 60 * 60;
  }
};

/**
 * Sign a JWT for the given userId.
 */
export const signToken = (userId: string): string =>
  jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: parseDuration(env.JWT_EXPIRES_IN),
    algorithm: 'HS256',
  });

/**
 * Verify and decode a JWT.
 * Returns null (instead of throwing) on invalid or expired tokens.
 */
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JwtPayload;
    return { userId: decoded.userId };
  } catch {
    return null;
  }
};

/**
 * Set the JWT as an HttpOnly cookie named 'wg_token'.
 */
export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  });
};

/**
 * Clear the 'wg_token' cookie.
 */
export const clearTokenCookie = (res: Response): void => {
  res.cookie(COOKIE_NAME, '', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
};
