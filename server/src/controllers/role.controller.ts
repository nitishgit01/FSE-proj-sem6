import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/Role.model';
import { asyncHandler } from '../utils/asyncHandler';

// ── Sanitisation ──────────────────────────────────────────────────────────────

/** Strip MongoDB operator characters from autocomplete query. */
const sanitiseQ = (v: string): string => v.replace(/[$.'"`\\]/g, '').trim();

// ── Controller ────────────────────────────────────────────────────────────────

/**
 * GET /api/roles?q=<query>
 *
 * Autocomplete search for canonical role titles used in the submission form
 * and filter sidebar.
 *
 * Search strategy (two-phase):
 *   Phase 1 — MongoDB full-text search on the `role_text_search` index
 *             ({ canonical: 10, aliases: 5 } weights).
 *             Results are relevance-ranked by $textScore.
 *
 *   Phase 2 — If the text search returns nothing (no matching tokens in the
 *             index, e.g. partial prefix "softw"), fall back to a case-
 *             insensitive $regex on canonical + aliases.
 *
 * Returns at most 10 results. Always 200.
 *
 * @example GET /api/roles?q=software   → [...top 10 matching roles]
 * @example GET /api/roles?q=x          → []  (< 2 chars)
 * @example GET /api/roles              → []  (no q param)
 */
export const searchRoles = asyncHandler(async (
  req:  Request,
  res:  Response,
  _next: NextFunction
): Promise<void> => {
  // ── Guard: require at least 2 characters ──────────────────────────────────
  const raw = req.query.q;
  if (typeof raw !== 'string' || raw.trim().length < 2) {
    res.status(200).json({ success: true, data: [] });
    return;
  }

  const q = sanitiseQ(raw);
  if (q.length < 2) {
    // After stripping operator chars the string might be too short
    res.status(200).json({ success: true, data: [] });
    return;
  }

  // ── Phase 1: Full-text search (relevance-ranked) ──────────────────────────
  type RoleDoc = { canonical: string; category: string };

  let roles = await Role.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' }, canonical: 1, category: 1 }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(10)
    .lean<RoleDoc[]>();

  // ── Phase 2: Regex fallback for prefix/partial matches ────────────────────
  if (roles.length === 0) {
    roles = await Role.find({
      $or: [
        { canonical: { $regex: q, $options: 'i' } },
        { aliases:   { $regex: q, $options: 'i' } },
      ],
    })
      .select('canonical category')
      .limit(10)
      .lean<RoleDoc[]>();
  }

  // ── Response: return only canonical + category — never aliases or _id ─────
  res.status(200).json({
    success: true,
    data: roles.map((r) => ({
      canonical: r.canonical,
      category:  r.category,
    })),
  });
});
