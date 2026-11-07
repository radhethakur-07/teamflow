import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const getWorkspaceAnalytics = async (workspaceId, { timeframe = '30d' } = {}) => {
  const wsObjectId = new mongoose.Types.ObjectId(workspaceId);
  const now = new Date();

  // Compute start date based on timeframe
  let days = 30;
  if (timeframe === '7d') days = 7;
  else if (timeframe === '90d') days = 90;
  else if (timeframe === 'all') days = 3650;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 1. Task Breakdown & Overdue Analytics
  const allWorkspaceTasks = await Task.find({ workspaceId: wsObjectId, isArchived: false })
    .populate('projectId', 'name color')
    .populate('assigneeIds', 'name avatarUrl email')
    .lean();

  const overdueTasks = allWorkspaceTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && !['done', 'completed'].includes(t.column)
  );

  const taskBreakdown = {
    todo: 0,
    inprogress: 0,
    review: 0,
    done: 0,
    total: allWorkspaceTasks.length,
  };

  allWorkspaceTasks.forEach((t) => {
    const col = t.column;
    if (col === 'todo') taskBreakdown.todo++;
    else if (col === 'inprogress' || col === 'in_progress') taskBreakdown.inprogress++;
    else if (col === 'review' || col === 'in_review') taskBreakdown.review++;
    else if (col === 'done' || col === 'completed') taskBreakdown.done++;
  });

  taskBreakdown.completionRate =
    taskBreakdown.total > 0
      ? Math.round((taskBreakdown.done / taskBreakdown.total) * 100)
      : 0;

  // 2. Project Completion Percentages & Metrics
  const projects = await Project.find({ workspaceId: wsObjectId, status: { $ne: 'archived' } }).lean();

  const projectMetrics = projects.map((proj) => {
    const projTasks = allWorkspaceTasks.filter(
      (t) => (t.projectId?._id || t.projectId)?.toString() === proj._id.toString()
    );
    const total = projTasks.length;
    const completed = projTasks.filter((t) => ['done', 'completed'].includes(t.column)).length;
    const inProgress = projTasks.filter((t) => ['inprogress', 'in_progress'].includes(t.column)).length;
    const overdue = projTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && !['done', 'completed'].includes(t.column)
    ).length;

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      _id: proj._id,
      id: proj._id,
      name: proj.name,
      color: proj.color,
      status: proj.status,
      dueDate: proj.dueDate,
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      overdueTasks: overdue,
      completionPercentage: percentage,
    };
  });

  // 3. Team Workload Metrics
  const members = await WorkspaceMember.find({ workspaceId: wsObjectId, status: 'active' })
    .populate('userId', 'name email avatarUrl jobTitle')
    .lean();

  const teamWorkload = members.map((m) => {
    const uId = (m.userId?._id || m.userId)?.toString();
    const assignedTasks = allWorkspaceTasks.filter((t) =>
      t.assigneeIds?.some((a) => (a._id || a)?.toString() === uId)
    );

    const total = assignedTasks.length;
    const completed = assignedTasks.filter((t) => ['done', 'completed'].includes(t.column)).length;
    const active = total - completed;

    return {
      userId: uId,
      name: m.userId?.name || 'Member',
      email: m.userId?.email || '',
      avatarUrl: m.userId?.avatarUrl || '',
      role: m.role,
      assignedCount: total,
      completedCount: completed,
      activeCount: active,
    };
  });

  // 4. Task Completion Trends (group by day in timeframe)
  const trendsRaw = await Task.aggregate([
    {
      $match: {
        workspaceId: wsObjectId,
        column: { $in: ['done', 'completed'] },
        updatedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
        completedCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const completionTrends = trendsRaw.map((t) => ({
    date: t._id,
    completed: t.completedCount,
  }));

  // 5. Activity Velocity
  const activityCount = await ActivityLog.countDocuments({
    workspaceId: wsObjectId,
    createdAt: { $gte: startDate },
  });

  return {
    timeframe,
    taskBreakdown,
    overdueSummary: {
      count: overdueTasks.length,
      tasks: overdueTasks,
    },
    projectMetrics,
    teamWorkload,
    completionTrends,
    activityVelocity: {
      totalEvents: activityCount,
      periodDays: days,
    },
  };
};
