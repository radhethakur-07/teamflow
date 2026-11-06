import { Team } from '../models/Team.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const createTeam = async (workspaceId, teamData, actorId) => {
  const existing = await Team.findOne({ workspaceId, name: teamData.name });
  if (existing) {
    const error = new Error('A team with this name already exists in this workspace.');
    error.statusCode = 409;
    error.code = 'TEAM_NAME_EXISTS';
    throw error;
  }

  const team = await Team.create({
    workspaceId,
    ...teamData,
  });

  await ActivityLog.create({
    workspaceId,
    actorId,
    action: 'TEAM_CREATED',
    details: { teamId: team._id, name: team.name },
  });

  return team;
};

export const getWorkspaceTeams = async (workspaceId) => {
  return Team.find({ workspaceId })
    .populate('leadId', 'name email avatarUrl')
    .populate('memberIds', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .lean();
};

export const getTeamById = async (workspaceId, teamId) => {
  const team = await Team.findOne({ _id: teamId, workspaceId })
    .populate('leadId', 'name email avatarUrl')
    .populate('memberIds', 'name email avatarUrl')
    .lean();

  if (!team) {
    const error = new Error('Team not found in this workspace.');
    error.statusCode = 404;
    error.code = 'TEAM_NOT_FOUND';
    throw error;
  }

  return team;
};

export const updateTeam = async (workspaceId, teamId, updateData) => {
  const team = await Team.findOneAndUpdate(
    { _id: teamId, workspaceId },
    updateData,
    { new: true }
  );

  if (!team) {
    const error = new Error('Team not found in this workspace.');
    error.statusCode = 404;
    error.code = 'TEAM_NOT_FOUND';
    throw error;
  }

  return team;
};

export const deleteTeam = async (workspaceId, teamId) => {
  const result = await Team.findOneAndDelete({ _id: teamId, workspaceId });
  if (!result) {
    const error = new Error('Team not found.');
    error.statusCode = 404;
    error.code = 'TEAM_NOT_FOUND';
    throw error;
  }
  return { success: true };
};
