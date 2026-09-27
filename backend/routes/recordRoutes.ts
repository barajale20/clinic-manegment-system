import { Router } from 'express';
import {
  getRecords,
  getRecordById,
  createRecord,
} from '../controllers/recordController.ts';
import { authenticateUser } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authenticateUser);

router.get('/', getRecords);
router.get('/:id', getRecordById);
router.post('/', createRecord);

export default router;
