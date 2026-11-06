import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongodbUri: process.env.MONGODB_URI || '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_change_in_production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    allowedOrigins: (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean)
  }
};
