import { Router } from 'express';
import healthRouter from './health.route.js';

const apiRouter = Router();

// Mount health routes
apiRouter.use('/health', healthRouter);

export default apiRouter;
