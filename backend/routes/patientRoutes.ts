import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.ts';
import { authenticateUser, requireRole } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authenticateUser);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
// Strictly Admin only to delete patients
router.delete('/:id', requireRole('admin'), deletePatient);

export default router;
