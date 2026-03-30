import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { ApiErrorCode } from '../../../shared/types/index';

/**
 * Custom error class for application errors.
 */
export class AppError extends Error {
  public statusCode: number;
  public code: ApiErrorCode;
  public fields?: Record<string, string>;

  constructor(
    message: string,
    statusCode: number,
    code: ApiErrorCode,
    fields?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handler — must be the LAST middleware registered.
 * Formats all errors into the standard ApiErrorResponse shape.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // ── Zod validation errors ───────────────────────────
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      fields[path] = e.message;
    });

    res.status(400).json({
      success: false,
      error: {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: 'Validation failed. Check the fields below.',
        fields,
      },
    });
    return;
  }

  // ── Known application errors ────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields && { fields: err.fields }),
      },
    });
    return;
  }

  // ── MongoDB duplicate key error ─────────────────────
  if ((err as Record<string, unknown>).code === 11000) {
    res.status(409).json({
      success: false,
      error: {
        code: ApiErrorCode.DUPLICATE_EMAIL,
        message: 'An account with this email already exists.',
      },
    });
    return;
  }

  // ── Unhandled errors ────────────────────────────────
  if (env.NODE_ENV === 'development') {
    console.error('❌ Unhandled error:', err);
  }

  res.status(500).json({
    success: false,
    error: {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: 'An internal server error occurred. Our team has been notified.',
    },
  });
};
