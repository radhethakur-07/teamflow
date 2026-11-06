import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/apiResponse.js';
import * as projectService from '../services/project.service.js';

export const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.params.workspaceId, req.body, req.user._id);
  return sendCreated(res, project, 'Project created successfully');
});

export const getProjects = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const { projects, total } = await projectService.getWorkspaceProjects(req.params.workspaceId, {
    status,
    search,
    page,
    limit,
  });
  return sendPaginated(res, projects, total, page, limit, 'Projects retrieved');
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId, req.workspaceId);
  return sendSuccess(res, project, 'Project retrieved');
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.projectId, req.workspaceId, req.body);
  return sendSuccess(res, project, 'Project updated successfully');
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.projectId, req.workspaceId);
  return sendSuccess(res, { success: true }, 'Project deleted');
});
