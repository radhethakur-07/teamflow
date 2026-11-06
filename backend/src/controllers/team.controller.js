import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import * as teamService from '../services/team.service.js';

export const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.params.workspaceId, req.body, req.user._id);
  return sendCreated(res, team, 'Team created successfully');
});

export const getTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.getWorkspaceTeams(req.params.workspaceId);
  return sendSuccess(res, teams, 'Teams retrieved');
});

export const getTeamById = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamById(req.params.workspaceId, req.params.teamId);
  return sendSuccess(res, team, 'Team details retrieved');
});

export const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.updateTeam(req.params.workspaceId, req.params.teamId, req.body);
  return sendSuccess(res, team, 'Team updated successfully');
});

export const deleteTeam = asyncHandler(async (req, res) => {
  await teamService.deleteTeam(req.params.workspaceId, req.params.teamId);
  return sendSuccess(res, { success: true }, 'Team deleted');
});
