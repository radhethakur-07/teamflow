import { Router } from 'express';
import * as teamController from '../controllers/team.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { requireWorkspaceRole } from '../middlewares/rbac.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createTeamSchema, updateTeamSchema } from '../validators/team.validator.js';

const router = Router({ mergeParams: true });

router.get('/', authenticateJWT, requireWorkspaceRole(), teamController.getTeams);
router.post(
  '/',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin', 'project_manager']),
  validateRequest(createTeamSchema),
  teamController.createTeam
);

router.get('/:teamId', authenticateJWT, requireWorkspaceRole(), teamController.getTeamById);
router.patch(
  '/:teamId',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin', 'project_manager']),
  validateRequest(updateTeamSchema),
  teamController.updateTeam
);
router.delete(
  '/:teamId',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin']),
  teamController.deleteTeam
);

export default router;
