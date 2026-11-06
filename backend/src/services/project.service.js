import crypto from 'crypto';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const createProject = async (workspaceId, projectData, actorId) => {
  const baseSlug = projectData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40);
  const slug = `${baseSlug}-${crypto.randomBytes(2).toString('hex')}`;

  const project = await Project.create({
    workspaceId,
    slug,
    leadId: projectData.leadId || actorId,
    memberIds: projectData.memberIds?.length ? projectData.memberIds : [actorId],
    ...projectData,
  });

  await ActivityLog.create({
    workspaceId,
    projectId: project._id,
    actorId,
    action: 'PROJECT_CREATED',
    details: { name: project.name, slug: project.slug },
  });

  return project;
};

export const getWorkspaceProjects = async (workspaceId, { status = 'active', search = '', page = 1, limit = 50 } = {}) => {
  const query = { workspaceId };
  if (status && status !== 'all') {
    query.status = status;
  }
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('leadId', 'name email avatarUrl')
      .populate('memberIds', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Project.countDocuments(query),
  ]);

  // Attach task throughput count dynamically
  const projectIds = projects.map((p) => p._id);
  const taskCounts = await Task.aggregate([
    { $match: { projectId: { $in: projectIds }, isArchived: false } },
    {
      $group: {
        _id: '$projectId',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $in: ['$column', ['done', 'completed']] }, 1, 0] },
        },
      },
    },
  ]);

  const countsMap = new Map();
  taskCounts.forEach((tc) => countsMap.set(tc._id.toString(), tc));

  const projectsWithCounts = projects.map((p) => {
    const counts = countsMap.get(p._id.toString()) || { totalTasks: 0, completedTasks: 0 };
    return {
      ...p,
      taskCount: counts.totalTasks,
      completedCount: counts.completedTasks,
    };
  });

  return { projects: projectsWithCounts, total };
};

export const getProjectById = async (projectId, workspaceId = null) => {
  const query = { _id: projectId };
  if (workspaceId) query.workspaceId = workspaceId;

  const project = await Project.findOne(query)
    .populate('leadId', 'name email avatarUrl')
    .populate('memberIds', 'name email avatarUrl')
    .lean();

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    error.code = 'PROJECT_NOT_FOUND';
    throw error;
  }

  const [totalTasks, completedTasks] = await Promise.all([
    Task.countDocuments({ projectId, isArchived: false }),
    Task.countDocuments({ projectId, column: { $in: ['done', 'completed'] }, isArchived: false }),
  ]);

  return { ...project, taskCount: totalTasks, completedCount: completedTasks };
};

export const updateProject = async (projectId, workspaceId, updateData) => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, workspaceId },
    updateData,
    { new: true }
  )
    .populate('leadId', 'name email avatarUrl')
    .populate('memberIds', 'name email avatarUrl');

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    error.code = 'PROJECT_NOT_FOUND';
    throw error;
  }

  return project;
};

export const deleteProject = async (projectId, workspaceId) => {
  const project = await Project.findOneAndDelete({ _id: projectId, workspaceId });
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    error.code = 'PROJECT_NOT_FOUND';
    throw error;
  }

  // Soft clean associated tasks
  await Task.updateMany({ projectId }, { isArchived: true });

  return { success: true };
};

export const getProjectActivities = async (projectId, workspaceId, limit = 30) => {
  return ActivityLog.find({ projectId, workspaceId })
    .populate('actorId', 'name email avatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};
