import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Parse a duration string like '7d', '24h', '60m' to seconds.
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
    default: return 7 * 24 * 60 * 60;
  }
};

/**
 * Sign a JWT token for a given user ID.
 */
export const signToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: parseDuration(env.JWT_EXPIRES_IN),
  });
};

/**
 * Verify and decode a JWT token.
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

/**
 * Set the JWT as an HttpOnly cookie on the response.
 */
export const setTokenCookie = (res: Response, token: string): void => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  res.cookie('token', token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'strict',
    domain: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
    maxAge,
    path: '/',
  });
};

/**
 * Clear the JWT cookie.
 */
export const clearTokenCookie = (res: Response): void => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'strict',
    domain: env.NODE_ENV === 'production' ? env.COOKIE_DOMAIN : undefined,
    maxAge: 0,
    path: '/',
  });
};
