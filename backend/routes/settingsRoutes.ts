import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.ts';
import { authenticateUser, requireRole } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authenticateUser);

// Admin-only access to clinic settings
router.get('/', requireRole('admin'), getSettings);
router.put('/', requireRole('admin'), updateSettings);

export default router;
