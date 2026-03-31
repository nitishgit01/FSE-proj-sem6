/**
 * matchBuilder.ts — Single Source of Truth for filter → $match conversion
 *
 * SECURITY-CRITICAL: Both anonGuard.ts (middleware) and stats.service.ts
 * (aggregation pipeline) must use the EXACT SAME match query. If these
 * diverge, an attacker can bypass the anonymisation guard.
 *
 * This module is the canonical implementation. Neither consumer should
 * build match queries independently.
 */

import type { FilterParams } from '../../../shared/types/index';

// ─── Sanitisation ─────────────────────────────────────────────────────────────

/**
 * Strip characters that could be used for NoSQL injection.
 * Defence-in-depth: express-mongo-sanitize already strips $ and . from
 * req.query, but values can reach the service layer from other callers.
 *
 * Stripped: $ . ' " ` \
 */
export const sanitise = (v: string): string =>
  v.replace(/[$.'"`\\]/g, '').trim();

/**
 * Clamp a value to the valid yearsExp range [0, 50].
 * Returns undefined for non-finite, non-numeric inputs.
 */
export const clampExp = (v: unknown): number | undefined => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(50, Math.round(n)));
};

// ─── Match builder ────────────────────────────────────────────────────────────

export type MatchQuery = Record<
  string,
  string | { $regex: string; $options: string } | { $gte: number; $lte: number }
>;

/**
 * Build a MongoDB filter document from (partial) FilterParams.
 *
 * Only non-empty, sanitised values are included. Each field uses the same
 * operator (exact, $regex, $gte/$lte) regardless of caller — this guarantees
 * query parity between the guard and the aggregation pipeline.
 *
 * @param filters  Loosely-typed filter bag — missing/undefined fields are
 *                 omitted from the returned match document.
 */
export const buildMatchStage = (filters: Partial<FilterParams>): MatchQuery => {
  const match: MatchQuery = {};

  // jobTitle: exact match (canonical — already normalised in DB)
  if (filters.jobTitle) {
    match.jobTitle = sanitise(filters.jobTitle);
  }

  // country: exact match, uppercased and sliced to 2 chars (ISO 3166-1)
  if (filters.country) {
    match.country = sanitise(filters.country).toUpperCase().slice(0, 2);
  }

  // city: case-insensitive substring match via $regex
  if (filters.city) {
    const safeCity = sanitise(filters.city);
    if (safeCity.length >= 2) {
      // Require at least 2 chars to avoid matching nearly every document
      match.city = { $regex: safeCity, $options: 'i' };
    }
  }

  // workMode: exact match
  if (filters.workMode) {
    match.workMode = sanitise(filters.workMode);
  }

  // companySize: exact match
  if (filters.companySize) {
    match.companySize = sanitise(filters.companySize);
  }

  // yearsExp: range filter — only applied when BOTH bounds are valid
  const expMin = clampExp(filters.expMin);
  const expMax = clampExp(filters.expMax);

  if (expMin !== undefined && expMax !== undefined) {
    match.yearsExp = { $gte: expMin, $lte: Math.max(expMin, expMax) };
  }

  return match;
};
