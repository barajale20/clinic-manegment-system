import { Router } from 'express';
import authRoutes from './authRoutes.ts';
import patientRoutes from './patientRoutes.ts';
import doctorRoutes from './doctorRoutes.ts';
import appointmentRoutes from './appointmentRoutes.ts';
import recordRoutes from './recordRoutes.ts';
import prescriptionRoutes from './prescriptionRoutes.ts';
import statsRoutes from './statsRoutes.ts';
import settingsRoutes from './settingsRoutes.ts';
import { getDbStatus } from '../config/db.ts';

const apiRouter = Router();

// Health & MongoDB Status
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CarePoint Clinic API (Node.js/Express + MongoDB)',
  });
});

apiRouter.get('/db-status', (_req, res) => {
  res.json(getDbStatus());
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/medical-records', recordRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/stats', statsRoutes);
apiRouter.use('/settings', settingsRoutes);

export default apiRouter;
