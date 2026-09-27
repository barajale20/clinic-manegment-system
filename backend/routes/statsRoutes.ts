import { Router } from 'express';
import { getStats } from '../controllers/statsController.ts';
import { authenticateUser } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authenticateUser);
router.get('/', getStats);

export default router;
