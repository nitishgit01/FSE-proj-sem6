/**
 * anonGuard.ts
 *
 * Exports two things:
 *
 * 1. checkAnonymisationThreshold(filters, minCount) — legacy async helper
 *    used by stats.service (kept for backwards compatibility — stats.service
 *    now embeds the count in the $facet and no longer calls this, but it
 *    is preserved in case other services need it).
 *
 * 2. checkMinSubmissions — Express middleware.
 *    Reads filter params from req.query, counts matching Submissions, and
 *    short-circuits with a 200 + { insufficient: true } response when the
 *    count < MIN_SUBMISSIONS.  Sets req.submissionCount on pass-through.
 */

import { Request, Response, NextFunction } from 'express';
import { Submission } from '../models/Submission.model';
import type { FilterParams } from '../../../shared/types/index';

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_SUBMISSIONS = 5;

// ─── Shared sanitisation ─────────────────────────────────────────────────────

/** Strip MongoDB operator characters from a filter string value. */
const sanitise = (v: string): string => v.replace(/[$.'"`\\]/g, '').trim();

/** Clamp yearsExp to [0, 50]; returns undefined for invalid inputs. */
const clampExp = (v: unknown): number | undefined => {
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(50, Math.round(n)));
};

// ─── Shared match builder ─────────────────────────────────────────────────────

type MatchQuery = Record<string, unknown>;

/**
 * Build a MongoDB filter document from FilterParams.
 * Only non-empty, sanitised values are included.
 */
const buildMatch = (filters: Partial<FilterParams>): MatchQuery => {
  const match: MatchQuery = {};

  if (filters.jobTitle) {
    match.jobTitle = sanitise(filters.jobTitle);
  }

  if (filters.country) {
    match.country = sanitise(filters.country).toUpperCase().slice(0, 2);
  }

  if (filters.city) {
    const safeCity = sanitise(filters.city);
    if (safeCity) match.city = { $regex: safeCity, $options: 'i' };
  }

  if (filters.workMode) {
    match.workMode = sanitise(filters.workMode);
  }

  if (filters.companySize) {
    match.companySize = sanitise(filters.companySize);
  }

  const expMin = clampExp(filters.expMin);
  const expMax = clampExp(filters.expMax);
  if (expMin !== undefined && expMax !== undefined) {
    match.yearsExp = { $gte: expMin, $lte: Math.max(expMin, expMax) };
  }

  return match;
};

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
 * Returns { passes, count }.
 *
 * @deprecated The stats pipeline now computes count inside $facet.
 * Use this only when you need a count check outside an aggregation.
 */
export const checkAnonymisationThreshold = async (
  filters: Partial<FilterParams>,
  minCount: number = MIN_SUBMISSIONS
): Promise<{ passes: boolean; count: number }> => {
  const count = await Submission.countDocuments(buildMatch(filters));
  return { passes: count >= minCount, count };
};

// ─── Express middleware ───────────────────────────────────────────────────────

/**
 * Middleware: checkMinSubmissions
 *
 * Guards any route that returns aggregated salary data by ensuring that
 * the matching submission set is large enough to preserve anonymity.
 *
 * Flow:
 *   • No jobTitle query param → skip guard (no meaningful filter to check).
 *   • count < 5 → respond 200 with { insufficient: true } and stop.
 *   • count ≥ 5 → set req.submissionCount and call next().
 */
export const checkMinSubmissions = async (
  req:  Request,
  res:  Response,
  next: NextFunction
): Promise<void> => {
  // No jobTitle means the request is too broad to guard meaningfully
  if (!req.query.jobTitle) {
    next();
    return;
  }

  // Parse filter params from query string (strings only at this layer)
  const filters: Partial<FilterParams> = {
    jobTitle:    typeof req.query.jobTitle    === 'string' ? req.query.jobTitle    : undefined,
    country:     typeof req.query.country     === 'string' ? req.query.country     : undefined,
    city:        typeof req.query.city        === 'string' ? req.query.city        : undefined,
    workMode:    typeof req.query.workMode    === 'string' ? req.query.workMode as FilterParams['workMode']    : undefined,
    companySize: typeof req.query.companySize === 'string' ? req.query.companySize as FilterParams['companySize'] : undefined,
    expMin:      req.query.expMin !== undefined ? Number(req.query.expMin) : undefined,
    expMax:      req.query.expMax !== undefined ? Number(req.query.expMax) : undefined,
  };

  try {
    const count = await Submission.countDocuments(buildMatch(filters));

    if (count < MIN_SUBMISSIONS) {
      res.status(200).json({
        success: true,
        data: {
          count,
          insufficient: true,
          message: 'Not enough submissions for this combination. Try broadening your filters.',
        },
      });
      // Do NOT call next() — response is already sent
      return;
    }

    // Pass the pre-computed count downstream so routes don't re-query
    req.submissionCount = count;
    next();
  } catch (err) {
    next(err);
  }
};
