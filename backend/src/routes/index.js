import { Router } from 'express';
import healthRouter from './health.route.js';
import authRouter from './auth.route.js';
import workspaceRouter from './workspace.route.js';
import teamRouter from './team.route.js';
import projectRouter from './project.route.js';
import taskRouter from './task.route.js';
import messageRouter from './message.route.js';
import notificationRouter from './notification.route.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import * as attachmentController from '../controllers/attachment.controller.js';

const apiRouter = Router();

// Health routes
apiRouter.use('/health', healthRouter);

// Auth & User routes
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', authRouter); // Supports /api/v1/users/me

// Workspaces
apiRouter.use('/workspaces', workspaceRouter);

// Teams (mounted under workspaces)
apiRouter.use('/workspaces/:workspaceId/teams', teamRouter);

// Projects (workspace-scoped and direct ID lookups)
apiRouter.use('/workspaces/:workspaceId/projects', projectRouter);
apiRouter.use('/projects', projectRouter);

// Tasks (workspace-scoped, project-scoped, and direct lookups)
apiRouter.use('/workspaces/:workspaceId/tasks', taskRouter);
apiRouter.use('/projects/:projectId/tasks', taskRouter);
apiRouter.use('/tasks', taskRouter);

// Real-Time Chat Messages & Notifications
apiRouter.use('/workspaces/:workspaceId/messages', messageRouter);
apiRouter.use('/notifications', notificationRouter);

// Cloudinary / File uploads
apiRouter.get('/upload/signature', authenticateJWT, attachmentController.getUploadSignature);
apiRouter.post('/upload', authenticateJWT, attachmentController.uploadAsset);

export default apiRouter;
