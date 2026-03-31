import { Router } from 'express';
import { getStats, getCount } from '../controllers/stats.controller';
import { globalLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/stats        — aggregated salary statistics (public, cached by CDN)
// GET /api/stats/count  — total submission count for landing page
router.get('/',      globalLimiter, getStats);
router.get('/count', globalLimiter, getCount);

export default router;
