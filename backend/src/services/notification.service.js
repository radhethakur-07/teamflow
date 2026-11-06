import { Notification } from '../models/Notification.js';
import { sendRealtimeNotification } from '../sockets/index.js';

export const getUserNotifications = async (userId, workspaceId, { unreadOnly = false, limit = 50, page = 1 } = {}) => {
  const query = { userId };
  if (workspaceId) query.workspaceId = workspaceId;
  if (unreadOnly) query.read = false;

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ userId, read: false }),
  ]);

  return {
    notifications,
    unreadCount,
    meta: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const createNotification = async ({ userId, workspaceId, type, title, message, link = '' }) => {
  const notification = await Notification.create({
    userId,
    workspaceId,
    type,
    title,
    message,
    link,
    read: false,
  });

  // Emit real-time socket event to user
  sendRealtimeNotification(userId, {
    _id: notification._id,
    id: notification._id,
    userId: notification.userId,
    workspaceId: notification.workspaceId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    read: notification.read,
    createdAt: notification.createdAt,
  });

  return notification;
};

export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    const error = new Error('Notification not found.');
    error.statusCode = 404;
    error.code = 'NOTIFICATION_NOT_FOUND';
    throw error;
  }

  return notification;
};

export const markAllNotificationsAsRead = async (userId, workspaceId) => {
  const query = { userId };
  if (workspaceId) query.workspaceId = workspaceId;

  await Notification.updateMany(query, { read: true });
  return { success: true };
};
