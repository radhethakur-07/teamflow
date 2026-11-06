import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as notificationService from '../services/notification.service.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, limit, page } = req.query;
  const workspaceId = req.workspaceId || req.query.workspaceId;

  const result = await notificationService.getUserNotifications(
    req.user._id,
    workspaceId,
    {
      unreadOnly: unreadOnly === 'true',
      limit,
      page,
    }
  );

  return sendSuccess(res, 'Notifications retrieved successfully', result.notifications, 200, {
    ...result.meta,
    unreadCount: result.unreadCount,
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationService.markNotificationAsRead(id, req.user._id);
  return sendSuccess(res, 'Notification marked as read', notification, 200);
});

export const markAllRead = asyncHandler(async (req, res) => {
  const workspaceId = req.workspaceId || req.query.workspaceId;
  const result = await notificationService.markAllNotificationsAsRead(req.user._id, workspaceId);
  return sendSuccess(res, 'All notifications marked as read', result, 200);
});
