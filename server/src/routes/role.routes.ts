import { Router } from 'express';
import { searchRoles } from '../controllers/role.controller';

const router = Router();

/**
 * GET /api/roles?q=<query>
 * Autocomplete for job title input. Public endpoint, no auth required.
 * Backed by MongoDB text index + regex fallback.
 * Rate-limited by globalLimiter in app.ts.
 */
router.get('/', searchRoles);

export default router;
