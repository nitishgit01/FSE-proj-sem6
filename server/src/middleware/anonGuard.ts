/**
 * anonGuard.ts — Anonymisation Guard (N ≥ 5)
 *
 * Prevents the API from returning aggregated salary data when the
 * matching cohort is too small to preserve individual anonymity.
 *
 * SECURITY-CRITICAL: The $match query used here MUST be identical to
 * the one used in stats.service.ts. Both import from the shared
 * matchBuilder module to guarantee parity.
 *
 * Exports:
 *   checkAnonymisationThreshold  — legacy async helper (deprecated)
 *   checkMinSubmissions           — Express middleware for route chains
 */

import { Request, Response, NextFunction } from 'express';
import { Submission } from '../models/Submission.model';
import { buildMatchStage } from '../utils/matchBuilder';
import type { FilterParams } from '../../../shared/types/index';

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_SUBMISSIONS = 5;

// ─── TypeScript augmentation ──────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      /** Set by checkMinSubmissions when the query passes the N≥5 guard. */
      submissionCount?: number;
    }
  }
}

// ─── Legacy async helper ──────────────────────────────────────────────────────

/**
 * Check whether a filter combination has at least `minCount` submissions.
 *
 * @deprecated The stats pipeline now computes count inside $facet.
 *             Use this only when you need a count check outside an aggregation.
 */
export const checkAnonymisationThreshold = async (
  filters: Partial<FilterParams>,
  minCount: number = MIN_SUBMISSIONS
): Promise<{ passes: boolean; count: number }> => {
  const count = await Submission.countDocuments(buildMatchStage(filters));
  return { passes: count >= minCount, count };
};

// ─── Express middleware ───────────────────────────────────────────────────────

/**
 * Middleware: checkMinSubmissions
 *
 * Guards any route that returns aggregated salary data.
 *
 * Flow:
 *   • No jobTitle, or jobTitle too short → skip guard, call next().
 *     The controller's Zod validation will reject with 400 if invalid.
 *   • count < 5 → respond 200 with { insufficient: true } and STOP.
 *     Never reveals the exact sub-threshold count (always returns 0).
 *   • count ≥ 5 → set req.submissionCount, call next().
 *
 * The service's $facet internally re-checks count < 5 as a final
 * atomic safety net, so a TOCTOU race here is not exploitable.
 */
export const checkMinSubmissions = async (
  req:  Request,
  res:  Response,
  next: NextFunction
): Promise<void> => {
  // ── F2 fix: validate type + minimum length ────────────────────────────────
  // Empty strings are falsy in JS, but we also need to reject single-char
  // jobTitles that would scan too broadly. If this skips, the controller's
  // Zod schema (min 2 chars) will reject with 400 — defence in depth.
  const jobTitle = req.query.jobTitle;
  if (typeof jobTitle !== 'string' || jobTitle.trim().length < 2) {
    next();
    return;
  }

  // Parse filter params from query string
  const filters: Partial<FilterParams> = {
    jobTitle,
    country:     typeof req.query.country     === 'string' ? req.query.country     : undefined,
    city:        typeof req.query.city        === 'string' ? req.query.city        : undefined,
    workMode:    typeof req.query.workMode    === 'string' ? req.query.workMode as FilterParams['workMode']    : undefined,
    companySize: typeof req.query.companySize === 'string' ? req.query.companySize as FilterParams['companySize'] : undefined,
    expMin:      req.query.expMin !== undefined ? Number(req.query.expMin) : undefined,
    expMax:      req.query.expMax !== undefined ? Number(req.query.expMax) : undefined,
  };

  try {
    // Uses the SAME buildMatchStage as stats.service → guaranteed parity
    const count = await Submission.countDocuments(buildMatchStage(filters));

    if (count < MIN_SUBMISSIONS) {
      // ── F4 fix: never reveal exact sub-threshold count ────────────
      // Returning count: 1, 2, 3, or 4 tells the attacker exactly how
      // many people in this cohort exist, enabling de-anonymisation
      // via correlation with public data (LinkedIn, career pages).
      res.status(200).json({
        success: true,
        data: {
          count:        0,    // Always 0 — masked
          insufficient: true,
          percentiles:  { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
          histogram:    [],
          currency:     '',
          message: 'Not enough submissions for this combination. Try broadening your filters.',
        },
      });
      // Do NOT call next() — response is already sent
      return;
    }

    // Pass the pre-computed count downstream
    req.submissionCount = count;
    next();
  } catch (err) {
    next(err);
  }
};
