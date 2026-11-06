import { Router } from 'express';
import { getDbStatus } from '../config/db.js';
import { config } from '../config/env.js';

const router = Router();
const serverStartTime = Date.now();

// Liveness probe: returns 200 as long as Express server is running
router.get('/', (req, res) => {
  const dbStatus = getDbStatus();
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: config.nodeEnv,
    version: '1.0.0',
    services: {
      api: 'operational',
      database: dbStatus.state,
    },
    meta: {
      nodeVersion: process.version,
      memoryUsageMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
  };

  res.status(200).json({
    success: true,
    data: healthData,
  });
});

// Readiness probe: verifies MongoDB Atlas connection
router.get('/ready', (req, res) => {
  const dbStatus = getDbStatus();
  const isReady = dbStatus.state === 'connected';

  const readinessData = {
    status: isReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  };

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    data: readinessData,
  });
});

export default router;
