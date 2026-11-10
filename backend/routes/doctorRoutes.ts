
import { Router } from 'express';

import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController';

import {
  authenticateUser,
  requireRole,
} from '../middleware/authMiddleware';

const router = Router();

// Dhammaan routes-kan waxay u baahan yihiin login.
router.use(authenticateUser);

// Dhakhaatiirta la akhrin karo user-ka login-ka sameeyey.
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Admin oo keliya ayaa maamuli kara dhakhaatiirta.
router.post('/', requireRole('admin'), createDoctor);
router.put('/:id', requireRole('admin'), updateDoctor);
router.delete('/:id', requireRole('admin'), deleteDoctor);

export default router;
