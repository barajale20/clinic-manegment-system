import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.ts';
import { authenticateUser, requireRole } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authenticateUser);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Admin-only management endpoints
router.post('/', requireRole('admin'), createDoctor);
router.put('/:id', requireRole('admin'), updateDoctor);
router.delete('/:id', requireRole('admin'), deleteDoctor);

export default router;
