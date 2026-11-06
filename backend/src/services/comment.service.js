import { Comment } from '../models/Comment.js';
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const getTaskComments = async (taskId, workspaceId) => {
  const task = await Task.findOne({ _id: taskId, workspaceId, isArchived: false });
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  return Comment.find({ taskId, workspaceId })
    .populate('authorId', 'name email avatarUrl jobTitle')
    .sort({ createdAt: 1 })
    .lean();
};

export const createComment = async ({ taskId, workspaceId, content, authorId }) => {
  const task = await Task.findOne({ _id: taskId, workspaceId, isArchived: false });
  if (!task) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    error.code = 'TASK_NOT_FOUND';
    throw error;
  }

  const comment = await Comment.create({
    taskId,
    workspaceId,
    content,
    authorId,
  });

  await ActivityLog.create({
    workspaceId,
    projectId: task.projectId,
    taskId: task._id,
    actorId: authorId,
    action: 'COMMENT_ADDED',
    details: { commentId: comment._id, snippet: content.slice(0, 80) },
  });

  return comment.populate('authorId', 'name email avatarUrl jobTitle');
};

export const deleteComment = async (commentId, workspaceId, userId, userRole) => {
  const comment = await Comment.findOne({ _id: commentId, workspaceId });
  if (!comment) {
    const error = new Error('Comment not found.');
    error.statusCode = 404;
    error.code = 'COMMENT_NOT_FOUND';
    throw error;
  }

  // Only the original author or workspace owner/admin can delete
  const isAuthor = comment.authorId.toString() === userId.toString();
  const isAdminOrOwner = ['workspace_owner', 'admin'].includes(userRole);

  if (!isAuthor && !isAdminOrOwner) {
    const error = new Error('You do not have permission to delete this comment.');
    error.statusCode = 403;
    error.code = 'INSUFFICIENT_PERMISSIONS';
    throw error;
  }

  await Comment.findByIdAndDelete(commentId);
  return { success: true };
};
