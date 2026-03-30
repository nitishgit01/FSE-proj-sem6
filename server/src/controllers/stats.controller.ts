import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as statsService from '../services/stats.service';
import { WORK_MODES, COMPANY_SIZES } from '../../../shared/types/index';

// ── Query Validation ──────────────────────────────────────

const statsQuerySchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  country: z.string().optional(),
  city: z.string().optional(),
  workMode: z.enum(WORK_MODES).optional(),
  companySize: z.enum(COMPANY_SIZES).optional(),
  expMin: z.coerce.number().int().min(0).optional(),
  expMax: z.coerce.number().int().max(50).optional(),
});

// ── Controller ────────────────────────────────────────────

/**
 * GET /api/stats
 * Returns aggregated salary statistics for a filter combination.
 * Enforces N ≥ 5 anonymisation guard.
 */
export const getStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = statsQuerySchema.parse(req.query);
    const stats = await statsService.getStats(query);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
