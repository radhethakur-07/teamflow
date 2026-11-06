import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import * as messageService from '../services/message.service.js';

export const getMessages = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { channelId, recipientId, limit, before } = req.query;

  const messages = await messageService.getMessages(workspaceId, req.user._id, {
    channelId,
    recipientId,
    limit,
    before,
  });

  return sendSuccess(res, 'Messages retrieved successfully', messages, 200);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { channelId, recipientId, content, clientTempId } = req.body;

  const message = await messageService.createMessage(workspaceId, req.user._id, {
    channelId,
    recipientId,
    content,
    clientTempId,
  });

  return sendCreated(res, 'Message sent successfully', message);
});

export const markRead = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { messageIds, channelId, recipientId } = req.body;

  const result = await messageService.markMessagesAsRead(workspaceId, req.user._id, {
    messageIds,
    channelId,
    recipientId,
  });

  return sendSuccess(res, 'Messages marked as read', result, 200);
});

export const getUnreadCounts = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const counts = await messageService.getUnreadCounts(workspaceId, req.user._id);
  return sendSuccess(res, 'Unread message counts retrieved', counts, 200);
});
