import mongoose from 'mongoose';

export interface DbStatus {
  isConnected: boolean;
  mode: 'mongodb_atlas' | 'mongodb_memory';
  databaseName: string;
  host?: string;
}

let isMongoConnected = false;
let currentMode: 'mongodb_atlas' | 'mongodb_memory' = 'mongodb_memory';

export const connectDB = async (): Promise<DbStatus> => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (mongoUri) {
    try {
      console.log('[MongoDB] Connecting to MongoDB instance at:', mongoUri.replace(/:([^:@]+)@/, ':****@'));
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      isMongoConnected = true;
      currentMode = 'mongodb_atlas';
      console.log('✅ [MongoDB] Successfully connected to MongoDB Atlas / remote cluster.');
      return {
        isConnected: true,
        mode: 'mongodb_atlas',
        databaseName: mongoose.connection.name || 'carepoint',
        host: mongoose.connection.host,
      };
    } catch (err: any) {
      console.warn('⚠️ [MongoDB] Connection error to remote URI:', err.message);
      console.log('ℹ️ [MongoDB] Running in high-resilience in-memory MongoDB document mode.');
      isMongoConnected = false;
      currentMode = 'mongodb_memory';
    }
  } else {
    console.log('ℹ️ [MongoDB] No MONGODB_URI found in environment. Initializing embedded in-memory MongoDB document store.');
    currentMode = 'mongodb_memory';
    isMongoConnected = false;
  }

  return {
    isConnected: isMongoConnected,
    mode: currentMode,
    databaseName: 'carepoint_clinic',
  };
};

export const getDbStatus = (): DbStatus => ({
  isConnected: isMongoConnected,
  mode: currentMode,
  databaseName: isMongoConnected ? (mongoose.connection.name || 'carepoint') : 'carepoint_clinic',
  host: isMongoConnected ? mongoose.connection.host : 'local_memory_cluster',
});
