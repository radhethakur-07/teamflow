import { WorkspaceMember } from '../models/WorkspaceMember.js';
import mongoose from 'mongoose';

export const requireWorkspaceRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    // Resolve workspace ID from route params, query, or custom header
    let workspaceId =
      req.params.workspaceId ||
      req.query.workspaceId ||
      req.headers['x-workspace-id'];

    // Resolve from project context if present
    if (
      !workspaceId &&
      req.params.projectId &&
      mongoose.Types.ObjectId.isValid(req.params.projectId)
    ) {
      const { Project } = await import('../models/Project.js');
      const project = await Project.findById(req.params.projectId).select('workspaceId');
      if (project) {
        workspaceId = project.workspaceId.toString();
        req.project = project;
      }
    }

    // Resolve from task context if present
    if (
      !workspaceId &&
      req.params.taskId &&
      mongoose.Types.ObjectId.isValid(req.params.taskId)
    ) {
      const { Task } = await import('../models/Task.js');
      const task = await Task.findById(req.params.taskId).select('workspaceId projectId');
      if (task) {
        workspaceId = task.workspaceId.toString();
        req.task = task;
      }
    }

    // Resolve from team context if present
    if (
      !workspaceId &&
      req.params.teamId &&
      mongoose.Types.ObjectId.isValid(req.params.teamId)
    ) {
      const { Team } = await import('../models/Team.js');
      const team = await Team.findById(req.params.teamId).select('workspaceId');
      if (team) {
        workspaceId = team.workspaceId.toString();
        req.team = team;
      }
    }

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'WORKSPACE_CONTEXT_REQUIRED',
          message: 'A valid workspace context is required for this operation.',
        },
      });
    }

    const userId = req.user._id;

    try {
      const membership = await WorkspaceMember.findOne({
        workspaceId,
        userId,
        status: 'active',
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_WORKSPACE_ACCESS',
            message: 'You are not a member of this workspace.',
          },
        });
      }

      // Check role authorization if specific roles are required
      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Action requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: ${membership.role}`,
          },
        });
      }

      req.workspaceMember = membership;
      req.workspaceId = workspaceId;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'RBAC_EVALUATION_ERROR',
          message: 'Error evaluating workspace permissions.',
        },
      });
    }
  };
};

export default requireWorkspaceRole;
