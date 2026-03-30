import { Router } from 'express';
import { searchRoles } from '../controllers/role.controller';

const router = Router();

// GET /api/roles?q=softw — public autocomplete endpoint
router.get('/', searchRoles);

export default router;
