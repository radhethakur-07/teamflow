import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const createTask = async (projectId, taskData, actorId, workspaceId) => {
  // If orderIndex not supplied, place at top
  const maxOrderTask = await Task.findOne({ projectId, column: taskData.column || 'todo' })
    .sort({ orderIndex: -1 })
    .select('orderIndex')
    .lean();

  const nextOrderIndex = maxOrderTask ? maxOrderTask.orderIndex + 1000 : 1000;

  const task = await Task.create({
    workspaceId,
    projectId,
    creatorId: actorId,
    orderIndex: taskData.orderIndex || nextOrderIndex,
    assigneeIds: taskData.assigneeIds?.length ? taskData.assigneeIds : [actorId],
    ...taskData,
  });

  await ActivityLog.create({
    workspaceId,
    projectId,
    taskId: task._id,
    actorId,
    action: 'TASK_CREATED',
    details: { title: task.title, column: task.column, priority: task.priority },
  });

  return task.populate('assigneeIds', 'name email avatarUrl');
};

export const getProjectTasks = async (projectId, workspaceId, { column, priority, search } = {}) => {
  const query = { projectId, workspaceId, isArchived: false };
  if (column && column !== 'all') {
    // Support aliases
    if (column === 'in_progress') query.column = { $in: ['inprogress', 'in_progress'] };
    else if (column === 'in_review') query.column = { $in: ['review', 'in_review'] };
    else if (column === 'completed') query.column = { $in: ['done', 'completed'] };
    else query.column = column;
  }
  if (priority && priority !== 'all') query.priority = priority;
  if (search) query.title = { $regex: search, $options: 'i' };

  return Task.find(query)
    .populate('assigneeIds', 'name email avatarUrl')
    .populate('creatorId', 'name email avatarUrl')
    .sort({ column: 1, orderIndex: 1, createdAt: -1 })
    .lean();
};

export const getMyWorkspaceTasks = async (workspaceId, userId, { priority, search, column } = {}) => {
  const query = {
    workspaceId,
    assigneeIds: userId,
    isArchived: false,
  };

  if (column && column !== 'all') {
    if (column === 'in_progress') query.column = { $in: ['inprogress', 'in_progress'] };
    else if (column === 'in_review') query.column = { $in: ['review', 'in_review'] };
    else if (column === 'completed') query.column = { $in: ['done', 'completed'] };
    else query.column = column;
  }
  if (priority && priority !== 'all') query.priority = priority;
  if (search) query.title = { $regex: search, $options: 'i' };

  return Task.find(query)
    .populate('assigneeIds', 'name email avatarUrl')
    .populate('creatorId', 'name email avatarUrl')
    .populate('projectId', 'name color slug')
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();
};

export const getAllWorkspaceTasks = async (
  workspaceId,
  { priority, search, column, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = {}
) => {
  const query = { workspaceId, isArchived: false };

  if (column && column !== 'all') {
    if (column === 'in_progress') query.column = { $in: ['inprogress', 'in_progress'] };
    else if (column === 'in_review') query.column = { $in: ['review', 'in_review'] };
    else if (column === 'completed') query.column = { $in: ['done', 'completed'] };
    else query.column = column;
  }
  if (priority && priority !== 'all') query.priority = priority;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assigneeIds', 'name email avatarUrl')
      .populate('creatorId', 'name email avatarUrl')
      .populate('projectId', 'name color slug')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean(),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    meta: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getTaskById = async (taskId, workspaceId) => {
  const task = await Task.findOne({ _id: taskId, workspaceId, isArchived: false })
    .populate('assigneeIds', 'name email avatarUrl')
    .populate('creatorId', 'name email avatarUrl')
    .populate('projectId', 'name color slug')
    .lean();

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  return task;
};

export const updateTask = async (taskId, workspaceId, updateData, actorId) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, workspaceId },
    updateData,
    { new: true }
  )
    .populate('assigneeIds', 'name email avatarUrl')
    .populate('projectId', 'name color slug');

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  await ActivityLog.create({
    workspaceId,
    projectId: task.projectId?._id || task.projectId,
    taskId: task._id,
    actorId,
    action: 'TASK_UPDATED',
    details: updateData,
  });

  return task;
};

export const moveTask = async (taskId, workspaceId, column, newOrderIndex, actorId) => {
  const task = await Task.findOne({ _id: taskId, workspaceId });
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  const previousColumn = task.column;
  task.column = column;
  if (typeof newOrderIndex === 'number') {
    task.orderIndex = newOrderIndex;
  }

  await task.save();

  await ActivityLog.create({
    workspaceId,
    projectId: task.projectId,
    taskId: task._id,
    actorId,
    action: 'TASK_MOVED',
    details: { from: previousColumn, to: column, newOrderIndex: task.orderIndex },
  });

  return task.populate('assigneeIds', 'name email avatarUrl');
};

export const deleteTask = async (taskId, workspaceId, actorId) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, workspaceId },
    { isArchived: true },
    { new: true }
  );

  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  await ActivityLog.create({
    workspaceId,
    projectId: task.projectId,
    taskId: task._id,
    actorId,
    action: 'TASK_DELETED',
    details: { title: task.title },
  });

  return { success: true };
};

export const addChecklistItem = async (taskId, workspaceId, title) => {
  const task = await Task.findOne({ _id: taskId, workspaceId });
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  task.checklist.push({ title, completed: false });
  await task.save();

  return task.checklist[task.checklist.length - 1];
};

export const toggleChecklistItem = async (taskId, workspaceId, itemId) => {
  const task = await Task.findOne({ _id: taskId, workspaceId });
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  const item = task.checklist.id(itemId);
  if (!item) {
    const error = new Error('Checklist item not found.');
    error.statusCode = 404;
    error.code = 'ITEM_NOT_FOUND';
    throw error;
  }

  item.completed = !item.completed;
  item.completedAt = item.completed ? new Date() : null;
  await task.save();

  return item;
};

export const deleteChecklistItem = async (taskId, workspaceId, itemId) => {
  const task = await Task.findOne({ _id: taskId, workspaceId });
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  task.checklist.pull({ _id: itemId });
  await task.save();

  return { success: true };
};
