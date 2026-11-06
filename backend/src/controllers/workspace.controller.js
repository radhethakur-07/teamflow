import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import * as workspaceService from '../services/workspace.service.js';

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.createWorkspace(req.body, req.user._id);
  return sendCreated(res, workspace, 'Workspace created successfully');
});

export const getWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.getUserWorkspaces(req.user._id);
  return sendSuccess(res, workspaces, 'Workspaces retrieved');
});

export const getWorkspaceById = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getWorkspaceById(req.params.workspaceId);
  return sendSuccess(res, workspace, 'Workspace details retrieved');
});

export const updateWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.updateWorkspace(req.params.workspaceId, req.body, req.user._id);
  return sendSuccess(res, workspace, 'Workspace updated successfully');
});

export const inviteMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const invitation = await workspaceService.inviteMember(req.params.workspaceId, email, role, req.user._id);
  return sendCreated(res, invitation, 'Invitation created successfully');
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const member = await workspaceService.acceptInvitation(token, req.user._id);
  return sendSuccess(res, member, 'Joined workspace successfully');
});

export const getMembers = asyncHandler(async (req, res) => {
  const members = await workspaceService.getWorkspaceMembers(req.params.workspaceId);
  return sendSuccess(res, members, 'Workspace members retrieved');
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { memberId, workspaceId } = req.params;
  const { role } = req.body;
  const updated = await workspaceService.updateMemberRole(workspaceId, memberId, role, req.user._id);
  return sendSuccess(res, updated, 'Member role updated');
});

export const removeMember = asyncHandler(async (req, res) => {
  const { memberId, workspaceId } = req.params;
  await workspaceService.removeMember(workspaceId, memberId, req.user._id);
  return sendSuccess(res, { success: true }, 'Member removed from workspace');
});
