import { Router } from 'express';
import healthRouter from './health.route.js';
import authRouter from './auth.route.js';
import workspaceRouter from './workspace.route.js';
import teamRouter from './team.route.js';
import projectRouter from './project.route.js';
import taskRouter from './task.route.js';

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

// Projects (both workspace-scoped and direct ID lookups)
apiRouter.use('/workspaces/:workspaceId/projects', projectRouter);
apiRouter.use('/projects', projectRouter);

// Tasks (both project-scoped and direct ID lookups)
apiRouter.use('/projects/:projectId/tasks', taskRouter);
apiRouter.use('/tasks', taskRouter);

export default apiRouter;
