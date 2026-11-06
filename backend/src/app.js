import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import healthRouter from './routes/health.route.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or curl/Postman requests with no origin
    if (!origin) return callback(null, true);
    
    // Check against allowed origins list or local network during development
    const allowed = config.cors.allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || allowedOrigin === '*';
    });

    if (allowed || !config.isProduction) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// HTTP Request Logging
if (!config.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP address. Please try again after 15 minutes.'
    }
  }
});

app.use(globalLimiter);

// Body Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check Direct Mounts
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);

// API Versioned Routes
app.use('/api/v1', apiRouter);

// Catch-all 404 handler
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

export default app;
