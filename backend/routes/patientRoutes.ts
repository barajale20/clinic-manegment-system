import express from 'express';
import { getPatients, createPatient } from '../controllers/patientController';

const router = express.Router();

// Halkaan ayay tahay in functions-ku ay si sax ah u socdaan
router.get('/', getPatients);
router.post('/', createPatient);

export default router;