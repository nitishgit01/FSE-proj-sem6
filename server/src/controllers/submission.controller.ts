import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as submissionService from '../services/submission.service';
import { isRateLimitError } from '../services/submission.service';
import { asyncHandler } from '../utils/asyncHandler';
import {
  INDUSTRIES,
  COMPANY_SIZES,
  WORK_MODES,
  GENDERS,
} from '../../../shared/types/index';

// ── Zod Validation Schema ────────────────────────────────────────────────────
//
// Mirrors the 3-step client form schema so invalid data is rejected at the
// perimeter. The service re-validates nothing — it trusts the controller.
//
// Field constraints match the Mongoose schema (Submission.model.ts) exactly.

const submissionSchema = z.object({
  // ── Step 1: Role ──────────────────────────────────────────────────────────
  jobTitle:    z.string().min(1, 'Job title is required').max(200).trim(),
  industry:    z.enum(INDUSTRIES),
  company:     z.string().max(200).trim().optional(),
  companySize: z.enum(COMPANY_SIZES),
  yearsExp:    z.number().int('Years must be a whole number').min(0).max(50),

  // ── Step 2: Compensation ──────────────────────────────────────────────────
  baseSalary: z
    .number()
    .min(1_000,       'Salary must be at least 1,000')
    .max(10_000_000,  'Salary cannot exceed 10,000,000'),
  currency: z
    .string()
    .length(3, 'Currency must be a 3-letter ISO 4217 code')
    .toUpperCase(),
  bonus:  z.number().min(0).optional().default(0),
  equity: z.number().min(0).optional().default(0),

  // ── Step 3: Location & Demographics ──────────────────────────────────────
  country: z
    .string()
    .length(2, 'Country must be a 2-letter ISO 3166-1 alpha-2 code')
    .toUpperCase(),
  city:     z.string().min(1, 'City is required').max(200).trim(),
  workMode: z.enum(WORK_MODES),
  gender:   z.enum(GENDERS).optional(),
});

// ── Controller ───────────────────────────────────────────────────────────────

/**
 * POST /api/submissions
 *
 * Creates a new salary submission and returns only the submission ID.
 * Works for both guests (no cookie) and authenticated users (wg_token).
 *
 * Security notes:
 *   - totalComp is computed server-side — the client cannot influence it.
 *   - Only submissionId is returned to the client — never the full document.
 *   - 30-day rate limit is enforced in the service for authenticated users.
 *   - Guests are IP rate-limited via submissionLimiter in the route layer.
 */
export const createSubmission = asyncHandler(async (
  req:  Request,
  res:  Response,
  _next: NextFunction
): Promise<void> => {
  // ── 1. Validate request body ─────────────────────────────────────────────
  // ZodError propagates to errorHandler which formats field-by-field errors.
  const payload = submissionSchema.parse(req.body);

  // ── 2. Extract optional userId (set by optionalAuth middleware) ───────────
  const userId = req.user?.userId;

  // ── 3. Delegate to service ───────────────────────────────────────────────
  let submission;
  try {
    submission = await submissionService.createSubmission(payload, userId);
  } catch (err: unknown) {
    // Surface 30-day cooldown as a structured 429 with the next eligible date
    if (isRateLimitError(err)) {
      res.status(429).json({
        success: false,
        error: {
          code:             'RATE_LIMITED',
          message:          err.message,
          nextEligibleDate: err.nextEligibleDate.toISOString(),
        },
      });
      return;
    }
    // Re-throw everything else — asyncHandler forwards to errorHandler
    throw err;
  }

  // ── 4. Return minimal response — NEVER the full document ─────────────────
  res.status(201).json({
    success: true,
    data: {
      submissionId: submission._id.toString(),
      message:      'Your salary has been submitted successfully.',
    },
  });
});
