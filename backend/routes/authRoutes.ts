import { Router } from 'express';
import { login, getCurrentUser, forgotPassword } from '../controllers/authController.ts';
import { authenticateUser, requireAuth } from '../middleware/authMiddleware.ts';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticateUser, requireAuth, getCurrentUser);

export default router;
