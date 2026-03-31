import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import * as statsService from '../services/stats.service';
import { WORK_MODES, COMPANY_SIZES } from '../../../shared/types/index';
import type { FilterParams } from '../../../shared/types/index';
import { asyncHandler } from '../utils/asyncHandler';

// ── Query Validation Schema ───────────────────────────────────────────────────
//
// Two-layer defence: controller validates shape/range; service sanitises values.
//
// Ordering note: expMax refinement runs after field-level validation so both
// values are available to compare.

const statsQuerySchema = z
  .object({
    jobTitle: z
      .string({ required_error: 'jobTitle is required' })
      .min(2, 'jobTitle must be at least 2 characters')
      .max(200),

    country: z
      .string()
      .length(2, 'country must be exactly 2 characters (ISO 3166-1 alpha-2)')
      .optional(),

    city: z
      .string()
      .max(100, 'city must be 100 characters or fewer')
      .optional(),

    workMode: z
      .enum(WORK_MODES, {
        errorMap: () => ({ message: `workMode must be one of: ${WORK_MODES.join(', ')}` }),
      })
      .optional(),

    companySize: z
      .enum(COMPANY_SIZES, {
        errorMap: () => ({ message: `companySize must be one of: ${COMPANY_SIZES.join(', ')}` }),
      })
      .optional(),

    // Query params arrive as strings — coerce to int, then range-check
    expMin: z.coerce
      .number()
      .int('expMin must be a whole number')
      .min(0,  'expMin must be at least 0')
      .max(50, 'expMin must be at most 50')
      .optional(),

    expMax: z.coerce
      .number()
      .int('expMax must be a whole number')
      .min(0,  'expMax must be at least 0')
      .max(50, 'expMax must be at most 50')
      .optional(),
  })
  .refine(
    (d) => {
      if (d.expMin !== undefined && d.expMax !== undefined) {
        return d.expMax >= d.expMin;
      }
      return true;
    },
    {
      message: 'expMax must be greater than or equal to expMin',
      path:    ['expMax'],
    }
  );

// ── Helper: format ZodError into structured field map ─────────────────────────

const formatZodErrors = (err: ZodError): Record<string, string> => {
  const fields: Record<string, string> = {};
  for (const issue of err.errors) {
    const key = issue.path.join('.') || 'query';
    fields[key] = issue.message;
  }
  return fields;
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/stats
 *
 * Returns aggregated salary statistics for a filter combination.
 * Always returns 200 — insufficient:true is not an error, it's a data state.
 *
 * The checkMinSubmissions middleware (in stats.routes.ts) intercepts before
 * this handler if the count falls below the anonymisation threshold.
 */
export const getStats = asyncHandler(async (
  req:  Request,
  res:  Response,
  _next: NextFunction
): Promise<void> => {
  // Validate — return 400 with per-field messages on failure
  let filters: FilterParams;
  try {
    filters = statsQuerySchema.parse(req.query) as FilterParams;
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code:    'VALIDATION_ERROR',
          message: 'Invalid query parameters.',
          fields:  formatZodErrors(err),
        },
      });
      return;
    }
    throw err;
  }

  const stats = await statsService.getStats(filters);

  // Always 200 — even when insufficient:true (client renders "not enough data" UI)
  res.status(200).json({ success: true, data: stats });
});

/**
 * GET /api/stats/count
 *
 * Returns the total number of salary submissions in the database.
 * Used by the landing page hero counter ("X salaries shared").
 */
export const getCount = asyncHandler(async (
  _req:  Request,
  res:   Response,
  _next: NextFunction
): Promise<void> => {
  const count = await statsService.getSubmissionCount();
  res.status(200).json({ success: true, data: { count } });
});
