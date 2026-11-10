
import mongoose from 'mongoose';

export interface DbStatus {
  isConnected: boolean;
  mode: 'mongodb_atlas' | 'mongodb_memory';
  databaseName: string;
  host?: string;
}

let isMongoConnected = false;
let currentMode: 'mongodb_atlas' | 'mongodb_memory' =
  'mongodb_memory';

export const connectDB = async (): Promise<DbStatus> => {
  const mongoUri =
    process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('[MongoDB] MONGODB_URI is missing.');
    return getDbStatus();
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isMongoConnected = true;
    currentMode = 'mongodb_atlas';

    console.log('✅ MongoDB connected successfully.');

    return {
      isConnected: true,
      mode: currentMode,
      databaseName: mongoose.connection.name || 'clinic-system',
      host: mongoose.connection.host,
    };
  } catch (error) {
    isMongoConnected = false;
    currentMode = 'mongodb_memory';

    console.error(
      '[MongoDB] Connection failed:',
      error instanceof Error ? error.message : error
    );

    return getDbStatus();
  }
};

export const getDbStatus = (): DbStatus => ({
  isConnected: isMongoConnected,
  mode: currentMode,
  databaseName: isMongoConnected
    ? mongoose.connection.name || 'clinic-system'
    : 'carepoint_clinic',
  host: isMongoConnected
    ? mongoose.connection.host
    : 'local_memory_cluster',
});
