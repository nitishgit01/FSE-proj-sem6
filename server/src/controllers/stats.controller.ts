import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as statsService from '../services/stats.service';
import { WORK_MODES, COMPANY_SIZES } from '../../../shared/types/index';
import { asyncHandler } from '../utils/asyncHandler';

// ── Query Validation ──────────────────────────────────────────────────────────
// Controller validates; service sanitises — two layers, defence-in-depth.

const statsQuerySchema = z.object({
  jobTitle:    z.string().min(1, 'jobTitle is required').max(200),
  country:     z.string().length(2).optional(),
  city:        z.string().max(200).optional(),
  workMode:    z.enum(WORK_MODES).optional(),
  companySize: z.enum(COMPANY_SIZES).optional(),
  expMin:      z.coerce.number().int().min(0).max(50).optional(),
  expMax:      z.coerce.number().int().min(0).max(50).optional(),
});

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/stats
 * Returns aggregated salary statistics for a filter combination.
 * Enforces N ≥ 5 anonymisation guard inside the service.
 */
export const getStats = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const filters = statsQuerySchema.parse(req.query);
  const stats   = await statsService.getStats(filters);

  res.status(200).json({ success: true, data: stats });
});

/**
 * GET /api/stats/count
 * Returns the total number of salary submissions.
 * Used by the landing page hero counter.
 */
export const getCount = asyncHandler(async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const count = await statsService.getSubmissionCount();

  res.status(200).json({ success: true, data: { count } });
});
