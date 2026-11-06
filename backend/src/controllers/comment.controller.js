import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import * as commentService from '../services/comment.service.js';

export const getTaskComments = asyncHandler(async (req, res) => {
  const comments = await commentService.getTaskComments(
    req.params.taskId,
    req.workspaceId
  );
  return sendSuccess(res, comments, 'Comments retrieved successfully');
});

export const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'CONTENT_REQUIRED', message: 'Comment content cannot be empty.' },
    });
  }

  const comment = await commentService.createComment({
    taskId: req.params.taskId,
    workspaceId: req.workspaceId,
    content: content.trim(),
    authorId: req.user._id,
  });

  return sendCreated(res, comment, 'Comment posted successfully');
});

export const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment(
    req.params.commentId,
    req.workspaceId,
    req.user._id,
    req.workspaceMember.role
  );
  return sendSuccess(res, { success: true }, 'Comment deleted successfully');
});
