import { Router } from 'express';
import { getStats } from '../controllers/stats.controller';

const router = Router();

// GET /api/stats — public endpoint, no auth required
router.get('/', getStats);

export default router;
