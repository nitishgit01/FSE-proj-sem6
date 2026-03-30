import { Router } from 'express';
import { createSubmission } from '../controllers/submission.controller';
import { optionalAuth } from '../middleware/optionalAuth';
import { submissionLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/submissions — works for both guests and logged-in users
router.post('/', submissionLimiter, optionalAuth, createSubmission);

export default router;
