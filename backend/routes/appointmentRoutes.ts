import { Router } from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from '../controllers/appointmentController.ts';
import { authenticateUser } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authenticateUser);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

export default router;
