import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { Project } from '../models/Project.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { getIO } from '../sockets/index.js';

export const getMessages = async (workspaceId, userId, { channelId, recipientId, limit = 50, before } = {}) => {
  const query = { workspaceId };

  if (recipientId) {
    // Direct messages: between userId and recipientId
    query.$or = [
      { senderId: userId, recipientId },
      { senderId: recipientId, recipientId: userId },
    ];
  } else if (channelId) {
    query.channelId = channelId;
    query.recipientId = null;
  } else {
    // Default to general channel
    query.channelId = 'general';
    query.recipientId = null;
  }

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('senderId', 'name email avatar jobTitle')
    .lean();

  // Return chronological order
  return messages.reverse();
};

export const createMessage = async (workspaceId, userId, { channelId, recipientId, content, clientTempId }) => {
  if (!content || !content.trim()) {
    const error = new Error('Message content cannot be empty.');
    error.statusCode = 400;
    error.code = 'INVALID_CONTENT';
    throw error;
  }

  const messageDoc = await Message.create({
    workspaceId,
    senderId: userId,
    recipientId: recipientId || null,
    channelId: channelId || (recipientId ? null : 'general'),
    content: content.trim(),
    readBy: [userId],
  });

  const populatedMessage = await Message.findById(messageDoc._id).populate(
    'senderId',
    'name email avatar jobTitle'
  );

  const io = getIO();
  if (io) {
    let canonicalRoom;
    if (recipientId) {
      const sorted = [userId.toString(), recipientId.toString()].sort();
      canonicalRoom = `direct:${sorted[0]}_${sorted[1]}`;
    } else if (channelId && channelId !== 'general') {
      canonicalRoom = channelId.startsWith('project:') ? channelId : `project:${channelId}`;
    } else {
      canonicalRoom = `workspace:${workspaceId}`;
    }

    const messageData = {
      _id: populatedMessage._id,
      id: populatedMessage._id,
      workspaceId: populatedMessage.workspaceId,
      senderId: populatedMessage.senderId,
      recipientId: populatedMessage.recipientId,
      channelId: populatedMessage.channelId,
      content: populatedMessage.content,
      readBy: populatedMessage.readBy,
      createdAt: populatedMessage.createdAt,
      clientTempId,
    };

    io.to(canonicalRoom).emit('message:received', {
      room: canonicalRoom,
      message: messageData,
    });

    if (recipientId) {
      io.to(`user:${recipientId}`).emit('message:received', {
        room: canonicalRoom,
        message: messageData,
      });
    }
  }

  return populatedMessage;
};

export const markMessagesAsRead = async (workspaceId, userId, { messageIds, channelId, recipientId }) => {
  const query = {
    workspaceId,
    readBy: { $ne: userId },
  };

  if (Array.isArray(messageIds) && messageIds.length > 0) {
    query._id = { $in: messageIds };
  } else if (recipientId) {
    query.senderId = recipientId;
    query.recipientId = userId;
  } else if (channelId) {
    query.channelId = channelId;
  }

  await Message.updateMany(query, {
    $addToSet: { readBy: userId },
  });

  return { success: true };
};

export const getUnreadCounts = async (workspaceId, userId) => {
  // Direct messages unread
  const unreadDirect = await Message.aggregate([
    {
      $match: {
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        recipientId: new mongoose.Types.ObjectId(userId),
        readBy: { $ne: new mongoose.Types.ObjectId(userId) },
      },
    },
    {
      $group: {
        _id: '$senderId',
        count: { $sum: 1 },
      },
    },
  ]);

  // Channel unread
  const unreadChannels = await Message.aggregate([
    {
      $match: {
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        recipientId: null,
        readBy: { $ne: new mongoose.Types.ObjectId(userId) },
      },
    },
    {
      $group: {
        _id: '$channelId',
        count: { $sum: 1 },
      },
    },
  ]);

  const directCounts = {};
  unreadDirect.forEach((item) => {
    directCounts[item._id.toString()] = item.count;
  });

  const channelCounts = {};
  unreadChannels.forEach((item) => {
    channelCounts[item._id] = item.count;
  });

  const totalUnread =
    unreadDirect.reduce((acc, cur) => acc + cur.count, 0) +
    unreadChannels.reduce((acc, cur) => acc + cur.count, 0);

  return {
    directCounts,
    channelCounts,
    totalUnread,
  };
};
