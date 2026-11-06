import { Router } from 'express';
import * as workspaceController from '../controllers/workspace.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { requireWorkspaceRole } from '../middlewares/rbac.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validators/workspace.validator.js';

const router = Router();

// Workspaces collection
router.get('/', authenticateJWT, workspaceController.getWorkspaces);
router.post('/', authenticateJWT, validateRequest(createWorkspaceSchema), workspaceController.createWorkspace);

// Specific workspace
router.get('/:workspaceId', authenticateJWT, requireWorkspaceRole(), workspaceController.getWorkspaceById);
router.patch(
  '/:workspaceId',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin']),
  validateRequest(updateWorkspaceSchema),
  workspaceController.updateWorkspace
);

// Member management
router.get('/:workspaceId/members', authenticateJWT, requireWorkspaceRole(), workspaceController.getMembers);
router.post(
  '/:workspaceId/invitations',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin']),
  validateRequest(inviteMemberSchema),
  workspaceController.inviteMember
);
router.post('/invitations/:token/accept', authenticateJWT, workspaceController.acceptInvitation);

router.patch(
  '/:workspaceId/members/:memberId',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin']),
  validateRequest(updateMemberRoleSchema),
  workspaceController.updateMemberRole
);

router.delete(
  '/:workspaceId/members/:memberId',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin']),
  workspaceController.removeMember
);

export default router;
