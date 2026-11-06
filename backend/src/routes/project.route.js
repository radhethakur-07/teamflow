import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { requireWorkspaceRole } from '../middlewares/rbac.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createProjectSchema, updateProjectSchema } from '../validators/project.validator.js';

const router = Router({ mergeParams: true });

// Workspace scoped project routes
router.get('/', authenticateJWT, requireWorkspaceRole(), projectController.getProjects);
router.post(
  '/',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin', 'project_manager']),
  validateRequest(createProjectSchema),
  projectController.createProject
);

// Single project operations
router.get('/:projectId', authenticateJWT, requireWorkspaceRole(), projectController.getProjectById);
router.patch(
  '/:projectId',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin', 'project_manager']),
  validateRequest(updateProjectSchema),
  projectController.updateProject
);
router.delete(
  '/:projectId',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin']),
  projectController.deleteProject
);

export default router;
