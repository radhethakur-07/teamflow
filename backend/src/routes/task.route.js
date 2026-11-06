import { Router } from 'express';
import * as taskController from '../controllers/task.controller.js';
import * as commentController from '../controllers/comment.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { requireWorkspaceRole } from '../middlewares/rbac.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  addChecklistItemSchema,
} from '../validators/task.validator.js';

const router = Router({ mergeParams: true });

// Workspace wide task views
router.get('/my-tasks', authenticateJWT, requireWorkspaceRole(), taskController.getMyTasks);
router.get('/all', authenticateJWT, requireWorkspaceRole(), taskController.getAllWorkspaceTasks);

// Project-scoped task operations
router.get('/', authenticateJWT, requireWorkspaceRole(), taskController.getTasks);
router.post(
  '/',
  authenticateJWT,
  requireWorkspaceRole(),
  validateRequest(createTaskSchema),
  taskController.createTask
);

// Specific task operations
router.get('/:taskId', authenticateJWT, requireWorkspaceRole(), taskController.getTaskById);
router.patch(
  '/:taskId',
  authenticateJWT,
  requireWorkspaceRole(),
  validateRequest(updateTaskSchema),
  taskController.updateTask
);

router.patch(
  '/:taskId/move',
  authenticateJWT,
  requireWorkspaceRole(),
  validateRequest(moveTaskSchema),
  taskController.moveTask
);

router.delete(
  '/:taskId',
  authenticateJWT,
  requireWorkspaceRole(['workspace_owner', 'admin', 'project_manager']),
  taskController.deleteTask
);

// Checklist items (subtasks)
router.post(
  '/:taskId/checklist',
  authenticateJWT,
  requireWorkspaceRole(),
  validateRequest(addChecklistItemSchema),
  taskController.addChecklistItem
);

router.patch(
  '/:taskId/checklist/:itemId',
  authenticateJWT,
  requireWorkspaceRole(),
  taskController.toggleChecklistItem
);

router.delete(
  '/:taskId/checklist/:itemId',
  authenticateJWT,
  requireWorkspaceRole(),
  taskController.deleteChecklistItem
);

// Task comments
router.get(
  '/:taskId/comments',
  authenticateJWT,
  requireWorkspaceRole(),
  commentController.getTaskComments
);

router.post(
  '/:taskId/comments',
  authenticateJWT,
  requireWorkspaceRole(),
  commentController.createComment
);

router.delete(
  '/:taskId/comments/:commentId',
  authenticateJWT,
  requireWorkspaceRole(),
  commentController.deleteComment
);

export default router;
