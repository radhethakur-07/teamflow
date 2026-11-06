import mongoose from 'mongoose';
import { config } from './env.js';

let dbConnectionState = 'disconnected';

export const connectDatabase = async () => {
  if (!config.mongodbUri) {
    console.warn('[Database] MONGODB_URI is not set. Running in disconnected mode.');
    dbConnectionState = 'unconfigured';
    return;
  }

  try {
    dbConnectionState = 'connecting';
    const conn = await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
    });

    dbConnectionState = 'connected';
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    dbConnectionState = 'error';
    console.error(`[Database] Connection Error: ${error.message}`);
    // Do not crash server so health checks and diagnostics remain responsive
  }
};

mongoose.connection.on('connected', () => {
  dbConnectionState = 'connected';
});

mongoose.connection.on('disconnected', () => {
  dbConnectionState = 'disconnected';
});

mongoose.connection.on('error', (err) => {
  dbConnectionState = 'error';
  console.error('[Database] Runtime error:', err.message);
});

export const getDbStatus = () => {
  const readyStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateFromMongoose = readyStates[mongoose.connection.readyState] || 'unknown';
  return {
    state: dbConnectionState === 'connected' ? 'connected' : stateFromMongoose,
    host: mongoose.connection.host || null,
    databaseName: mongoose.connection.name || null
  };
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    dbConnectionState = 'disconnected';
    console.log('[Database] MongoDB connection closed.');
  }
};
