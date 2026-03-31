import crypto from 'crypto';
import { Submission, ISubmissionDocument } from '../models/Submission.model';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { AppError } from '../middleware/errorHandler';
import { ApiErrorCode } from '../../../shared/types/index';
import type { CreateSubmissionPayload } from '../../../shared/types/index';

// ─── Rate limit error ─────────────────────────────────────────────────────────

/**
 * Typed error thrown when a user submits before the 30-day cooldown ends.
 * The controller catches this specific shape and returns 429 + nextEligibleDate.
 */
export interface SubmissionRateLimitError extends Error {
  code:            'RATE_LIMITED';
  statusCode:      429;
  nextEligibleDate: Date;
}

const isRateLimitError = (err: unknown): err is SubmissionRateLimitError =>
  err instanceof Error &&
  (err as SubmissionRateLimitError).code === 'RATE_LIMITED';

export { isRateLimitError };

// ─── Title normalisation ──────────────────────────────────────────────────────

/**
 * Resolve a user-supplied job title to the canonical form stored in the
 * roles collection.
 *
 * Lookup order:
 *   1. Exact match on `canonical` (case-insensitive)
 *   2. Case-insensitive match inside `aliases` array
 *   3. No match → return the trimmed original
 *
 * Two DB queries (both use indexes) is acceptable here; the roles collection
 * is tiny (≤ 200 docs) and can be cached with a simple TTL Map if needed.
 */
const escapeRegex = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveJobTitle = async (rawTitle: string): Promise<string> => {
  const trimmed = rawTitle.trim();
  const pattern = new RegExp(`^${escapeRegex(trimmed)}$`, 'i');

  const role = await Role.findOne({
    $or: [
      { canonical: { $regex: pattern } },
      { aliases:   { $regex: pattern } },
    ],
  }).select('canonical').lean();

  return role?.canonical ?? trimmed;
};

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * Create a salary submission.
 *
 * Steps:
 *   1. Resolve jobTitle → canonical form (or keep raw)
 *   2. Compute totalComp = baseSalary + bonus + equity (server-side, never trust client)
 *   3. If userId → check 30-day cooldown; throw SubmissionRateLimitError if too early
 *   4. Persist Submission document
 *   5. If userId → increment user.submissionCount + set lastSubmittedAt
 *
 * @param payload  Validated CreateSubmissionPayload from the controller.
 * @param userId   Optional — undefined for guest (anonymous) submissions.
 */
export const createSubmission = async (
  payload: CreateSubmissionPayload,
  userId?: string
): Promise<ISubmissionDocument> => {

  // ── Step 1: Resolve canonical job title ─────────────────────────────────
  const [jobTitle, jobTitleRaw] = await (async () => {
    const canonical = await resolveJobTitle(payload.jobTitle);
    return [canonical, payload.jobTitle] as const;
  })();

  // ── Step 2: Compute totalComp server-side ────────────────────────────────
  const bonus    = payload.bonus  ?? 0;
  const equity   = payload.equity ?? 0;
  const totalComp = payload.baseSalary + bonus + equity;

  // ── Step 3: Authenticated rate limit check ───────────────────────────────
  if (userId) {
    const user = await User.findById(userId).select('lastSubmittedAt').lean();

    if (user?.lastSubmittedAt) {
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - user.lastSubmittedAt.getTime();

      if (elapsed < THIRTY_DAYS_MS) {
        const nextEligibleDate = new Date(user.lastSubmittedAt.getTime() + THIRTY_DAYS_MS);
        const err = Object.assign(
          new Error(`You can submit again on ${nextEligibleDate.toLocaleDateString()}.`),
          {
            code:             'RATE_LIMITED' as const,
            statusCode:       429 as const,
            nextEligibleDate,
          }
        ) satisfies SubmissionRateLimitError;
        throw err;
      }
    }
  }

  // ── Step 4: Persist submission ───────────────────────────────────────────
  const submission = await Submission.create({
    userId:      userId ?? null,
    jobTitle,
    jobTitleRaw,
    industry:    payload.industry,
    company:     payload.company  ?? null,
    companySize: payload.companySize,
    baseSalary:  payload.baseSalary,
    bonus,
    equity,
    totalComp,
    currency:    payload.currency.toUpperCase(),
    country:     payload.country.toUpperCase(),
    city:        payload.city,
    workMode:    payload.workMode,
    yearsExp:    payload.yearsExp,
    gender:      payload.gender ?? null,
    skills:      [],
    verified:    false,
    submittedAt: new Date(),
  });

  // ── Step 5: Update user tracking (fire-and-forget; non-blocking) ─────────
  if (userId) {
    // Non-blocking — a failure here doesn't fail the submission itself
    User.findByIdAndUpdate(userId, {
      $inc: { submissionCount: 1 },
      $set: { lastSubmittedAt: new Date() },
    }).catch((updateErr: unknown) => {
      // Log but don't propagate — submission is already committed
      console.error('[submission.service] Failed to update user tracking:', updateErr);
    });
  }

  return submission;
};

// ─── Submission fingerprint (idempotency helper) ──────────────────────────────

/**
 * Create a SHA-256 fingerprint of a submission for deduplication.
 * The fingerprint covers the fields that define a unique submission.
 *
 * Use case: client sends same form twice (double-click, retry) — the controller
 * can compute this hash and check for a recent duplicate before inserting.
 *
 * NOT currently wired to the POST /submit endpoint but exported for future use.
 */
export const fingerprintSubmission = (
  payload: Pick<CreateSubmissionPayload, 'jobTitle' | 'baseSalary' | 'currency' | 'country' | 'city'>
): string =>
  crypto
    .createHash('sha256')
    .update(JSON.stringify({
      jobTitle:   payload.jobTitle.trim().toLowerCase(),
      baseSalary: payload.baseSalary,
      currency:   payload.currency.toUpperCase(),
      country:    payload.country.toUpperCase(),
      city:       payload.city.trim().toLowerCase(),
    }))
    .digest('hex');
