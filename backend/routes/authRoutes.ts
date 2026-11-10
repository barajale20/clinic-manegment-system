
import express from 'express';

import {
  register,
  login,
  getPendingUsers,
  updateUserStatus,
} from '../controllers/authController';

import {
  protect,
  adminOnly,
} from '../middleware/authMiddleware';

const router = express.Router();

// Public authentication routes
router.post('/register', register);
router.post('/login', login);

// Admin-only user management routes
router.get(
  '/pending-users',
  protect,
  adminOnly,
  getPendingUsers
);

router.put(
  '/users/:userId/status',
  protect,
  adminOnly,
  updateUserStatus
);

export default router;
