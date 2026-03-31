import { Router } from 'express';
import {
  register,
  login,
  logout,
  verifyEmail,
  resendVerification,
  getMe,
} from '../controllers/auth.controller';
import { requireAuth }   from '../middleware/requireAuth';
import { authLimiter, resendLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public — rate-limited
router.post('/register',             authLimiter,   register);
router.post('/login',                authLimiter,   login);
router.get( '/verify/:token',                       verifyEmail);
router.post('/resend-verification',  resendLimiter, resendVerification);

// Protected
router.post('/logout', requireAuth, logout);
router.get( '/me',     requireAuth, getMe);

export default router;
