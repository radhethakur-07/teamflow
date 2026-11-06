import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import healthRouter from './routes/health.route.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = config.cors.allowedOrigins.some((allowedOrigin) => {
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-workspace-id'],
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
  windowMs: 15 * 60 * 1000,
  max: 500, // 500 requests per 15 minutes window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP address. Please try again after 15 minutes.',
    },
  },
});

app.use(globalLimiter);

// Body and Cookie Parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(config.cookieSecret));

// Health & Readiness Probes
app.use('/health', healthRouter);
app.use('/api/health', healthRouter);
app.get('/ready', (req, res) => res.redirect('/api/health/ready'));
app.get('/api/ready', (req, res) => res.redirect('/api/health/ready'));

// Versioned API Routes (/api/v1/...)
app.use('/api/v1', apiRouter);

// Catch-all 404 handler
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

export default app;
