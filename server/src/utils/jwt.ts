import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Sign a JWT token for a given user ID.
 */
export const signToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
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
