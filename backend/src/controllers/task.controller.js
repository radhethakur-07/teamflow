import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import * as taskService from '../services/task.service.js';

export const createTask = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId || req.body.projectId;
  const task = await taskService.createTask(
    projectId,
    req.body,
    req.user._id,
    req.workspaceId
  );
  return sendCreated(res, task, 'Task created successfully');
});

export const getTasks = asyncHandler(async (req, res) => {
  const { column, priority, search } = req.query;
  const tasks = await taskService.getProjectTasks(req.params.projectId, req.workspaceId, {
    column,
    priority,
    search,
  });
  return sendSuccess(res, tasks, 'Tasks retrieved');
});

export const getMyTasks = asyncHandler(async (req, res) => {
  const { priority, search, column } = req.query;
  const tasks = await taskService.getMyWorkspaceTasks(req.workspaceId, req.user._id, {
    priority,
    search,
    column,
  });
  return sendSuccess(res, tasks, 'My tasks retrieved successfully');
});

export const getAllWorkspaceTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getAllWorkspaceTasks(req.workspaceId, req.query);
  return sendSuccess(res, result.tasks, 'Workspace tasks retrieved', result.meta);
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, req.workspaceId);
  return sendSuccess(res, task, 'Task details retrieved');
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(
    req.params.taskId,
    req.workspaceId,
    req.body,
    req.user._id
  );
  return sendSuccess(res, task, 'Task updated successfully');
});

export const moveTask = asyncHandler(async (req, res) => {
  const { column, orderIndex } = req.body;
  const task = await taskService.moveTask(
    req.params.taskId,
    req.workspaceId,
    column,
    orderIndex,
    req.user._id
  );
  return sendSuccess(res, task, 'Task moved successfully');
});

export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.taskId, req.workspaceId, req.user._id);
  return sendSuccess(res, { success: true }, 'Task deleted');
});

export const addChecklistItem = asyncHandler(async (req, res) => {
  const item = await taskService.addChecklistItem(
    req.params.taskId,
    req.workspaceId,
    req.body.title
  );
  return sendCreated(res, item, 'Checklist item added');
});

export const toggleChecklistItem = asyncHandler(async (req, res) => {
  const item = await taskService.toggleChecklistItem(
    req.params.taskId,
    req.workspaceId,
    req.params.itemId
  );
  return sendSuccess(res, item, 'Checklist item toggled');
});

export const deleteChecklistItem = asyncHandler(async (req, res) => {
  await taskService.deleteChecklistItem(
    req.params.taskId,
    req.workspaceId,
    req.params.itemId
  );
  return sendSuccess(res, { success: true }, 'Checklist item deleted');
});
