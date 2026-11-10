
import express, { Express } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import apiRouter from './routes/index';
import authRoutes from './routes/authRoutes';
import { connectDB } from './config/db';

const seedAdminAccount = async (): Promise<void> => {
  try {
    const adminEmail = (
      process.env.ADMIN_EMAIL || 'admin@carepoint.com'
    ).trim().toLowerCase();

    const adminPassword =
      process.env.ADMIN_PASSWORD || 'password123';

    const adminName =
      process.env.ADMIN_NAME || 'System Administrator';

    const usersCollection = mongoose.connection.collection('users');

    const existingAdmin = await usersCollection.findOne({
      email: adminEmail,
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await usersCollection.insertOne({
        fullName: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('Default Admin account created successfully.');
    } else {
      console.log('Admin account already exists in MongoDB.');
    }
  } catch (error) {
    console.error('Failed to seed Admin account:', error);
    throw error;
  }
};

export const createApp = async (): Promise<Express> => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect MongoDB
  await connectDB();

  // Create default Admin only if one does not exist
  await seedAdminAccount();

  // Health check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'CarePoint API is running.',
    });
  });

  // Authentication routes
  app.use('/api', authRoutes);

  // Other application API routes
  app.use('/api', apiRouter);

  return app;
};
