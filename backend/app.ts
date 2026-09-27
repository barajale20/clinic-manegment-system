import express, { Express } from 'express';
import apiRouter from './routes/index.ts';
import { connectDB } from './config/db.ts';

export const createApp = async (): Promise<Express> => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize MongoDB connection
  await connectDB();

  // Mount API router
  app.use('/api', apiRouter);

  return app;
};
