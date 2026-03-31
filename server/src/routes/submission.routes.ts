import { Router } from 'express';
import { createSubmission } from '../controllers/submission.controller';
import { optionalAuth } from '../middleware/optionalAuth';
import { submissionLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /api/submissions
 *
 * Middleware chain:
 *   submissionLimiter  — IP-based rate limit (10 req/hour) against guest spam
 *   optionalAuth       — attaches req.user if wg_token cookie is valid; guests pass through
 *   createSubmission   — validates, creates, returns submissionId
 *
 * No requireAuth — guest submissions are intentionally supported.
 * The 30-day authenticated rate limit is enforced inside the service.
 */
router.post('/', submissionLimiter, optionalAuth, createSubmission);

export default router;
