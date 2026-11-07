import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Detect automated test execution across platforms
const isTest =
  process.env.NODE_ENV === 'test' ||
  process.execArgv.some((arg) => arg.includes('test')) ||
  process.argv.some((arg) => arg.includes('test'));

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || (isTest ? 'test' : 'development'),
  isProduction: process.env.NODE_ENV === 'production',
  isTest,
  mongodbUri: process.env.MONGODB_URI || '',
  cookieSecret: process.env.COOKIE_SECRET || 'dev_teamflow_cookie_signing_secret_9921_key',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_change_in_production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@teamflow.app',
    senderName: process.env.BREVO_SENDER_NAME || 'TeamFlow Security',
  },
  auth: {
    otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 15,
    resetExpiryMinutes: parseInt(process.env.RESET_EXPIRY_MINUTES, 10) || 15,
    emailVerificationExpiryHours: parseInt(process.env.EMAIL_VERIFY_EXPIRY_HOURS, 10) || 24,
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    allowedOrigins: (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
};
