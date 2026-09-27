import { Router } from 'express';
import {
  getPrescriptions,
  createPrescription,
  updatePrescriptionStatus,
} from '../controllers/prescriptionController.ts';
import { authenticateUser } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authenticateUser);

router.get('/', getPrescriptions);
router.post('/', createPrescription);
router.patch('/:id/status', updatePrescriptionStatus);

export default router;
