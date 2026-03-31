import { Router } from 'express';
import { getStats, getCount } from '../controllers/stats.controller';
import { checkMinSubmissions } from '../middleware/anonGuard';

const router = Router();

/**
 * GET /api/stats
 *
 * Middleware chain:
 *   checkMinSubmissions  — counts matching submissions; short-circuits with
 *                          200 { insufficient:true } if count < 5
 *   getStats             — validates params, runs $facet pipeline, returns result
 *
 * Note: no extra rate limiter here — globalLimiter in app.ts covers all routes.
 * Add a dedicated limiter if this endpoint proves expensive in production.
 */
router.get('/', checkMinSubmissions, getStats);

/**
 * GET /api/stats/count
 * Landing page hero counter — no anonymisation guard needed (just a total count).
 */
router.get('/count', getCount);

export default router;
