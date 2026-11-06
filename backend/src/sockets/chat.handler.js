import { Message } from '../models/Message.js';
import { RoomManager } from './room.manager.js';

export const registerChatHandlers = (io, socket) => {
  const userId = socket.userId;

  /**
   * Send a direct or room message with persistence and deduplication
   */
  socket.on('message:send', async (payload, callback) => {
    try {
      const {
        workspaceId,
        recipientId,
        channelId,
        content,
        clientTempId,
      } = payload || {};

      if (!content || typeof content !== 'string' || !content.trim()) {
        const err = { error: 'Message content cannot be empty' };
        if (typeof callback === 'function') callback(err);
        return socket.emit('error', err);
      }

      if (content.length > 5000) {
        const err = { error: 'Message cannot exceed 5000 characters' };
        if (typeof callback === 'function') callback(err);
        return socket.emit('error', err);
      }

      let canonicalRoom;
      let targetWorkspaceId = workspaceId;

      if (recipientId) {
        // Direct message
        const access = await RoomManager.validateRoomAccess(userId, `direct:${recipientId}`);
        if (!access.allowed) {
          const err = { error: access.error };
          if (typeof callback === 'function') callback(err);
          return socket.emit('error', err);
        }
        canonicalRoom = access.canonicalRoom;
        targetWorkspaceId = targetWorkspaceId || access.workspaceId;
      } else if (channelId) {
        // Project or channel room
        const roomName = channelId.startsWith('project:') ? channelId : `project:${channelId}`;
        const access = await RoomManager.validateRoomAccess(userId, roomName);
        if (!access.allowed) {
          const err = { error: access.error };
          if (typeof callback === 'function') callback(err);
          return socket.emit('error', err);
        }
        canonicalRoom = access.canonicalRoom;
        targetWorkspaceId = targetWorkspaceId || access.workspaceId;
      } else if (workspaceId) {
        // Workspace general channel
        const access = await RoomManager.validateRoomAccess(userId, `workspace:${workspaceId}`);
        if (!access.allowed) {
          const err = { error: access.error };
          if (typeof callback === 'function') callback(err);
          return socket.emit('error', err);
        }
        canonicalRoom = access.canonicalRoom;
      } else {
        const err = { error: 'A valid recipientId, channelId, or workspaceId is required' };
        if (typeof callback === 'function') callback(err);
        return socket.emit('error', err);
      }

      // Persist in MongoDB
      const messageDoc = await Message.create({
        workspaceId: targetWorkspaceId,
        senderId: userId,
        recipientId: recipientId || null,
        channelId: channelId || 'general',
        content: content.trim(),
        readBy: [userId],
      });

      const populatedMessage = await Message.findById(messageDoc._id).populate(
        'senderId',
        'name email avatar jobTitle'
      );

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

      // Broadcast to room
      io.to(canonicalRoom).emit('message:received', {
        room: canonicalRoom,
        message: messageData,
      });

      // If direct message, ensure recipient also receives it in their personal room
      if (recipientId) {
        io.to(`user:${recipientId}`).emit('message:received', {
          room: canonicalRoom,
          message: messageData,
        });
      }

      if (typeof callback === 'function') {
        callback({ success: true, message: messageData });
      }
    } catch (error) {
      console.error('[Socket Chat Error] message:send failed:', error.message);
      const err = { error: 'Failed to deliver message' };
      if (typeof callback === 'function') callback(err);
      socket.emit('error', err);
    }
  });

  /**
   * Typing Indicators
   */
  socket.on('typing:start', async ({ room }) => {
    if (!room) return;
    const access = await RoomManager.validateRoomAccess(userId, room);
    if (!access.allowed) return;

    socket.to(access.canonicalRoom).emit('typing:update', {
      room: access.canonicalRoom,
      userId,
      userName: socket.user.name,
      isTyping: true,
    });
  });

  socket.on('typing:stop', async ({ room }) => {
    if (!room) return;
    const access = await RoomManager.validateRoomAccess(userId, room);
    if (!access.allowed) return;

    socket.to(access.canonicalRoom).emit('typing:update', {
      room: access.canonicalRoom,
      userId,
      userName: socket.user.name,
      isTyping: false,
    });
  });

  /**
   * Read Receipts
   */
  socket.on('message:read', async ({ messageIds, room }) => {
    try {
      if (!Array.isArray(messageIds) || messageIds.length === 0) return;

      await Message.updateMany(
        {
          _id: { $in: messageIds },
          readBy: { $ne: userId },
        },
        {
          $addToSet: { readBy: userId },
        }
      );

      if (room) {
        const access = await RoomManager.validateRoomAccess(userId, room);
        if (access.allowed) {
          socket.to(access.canonicalRoom).emit('message:read_receipt', {
            room: access.canonicalRoom,
            readerId: userId,
            messageIds,
          });
        }
      }
    } catch (err) {
      console.error('[Socket Chat Error] message:read failed:', err.message);
    }
  });
};

export default registerChatHandlers;
