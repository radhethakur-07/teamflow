import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  
  const response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
      details: err.details || null
    }
  };

  if (!config.isProduction && err.stack) {
    response.error.stack = err.stack;
  }

  console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode}:`, err.message);

  res.status(statusCode).json(response);
};
