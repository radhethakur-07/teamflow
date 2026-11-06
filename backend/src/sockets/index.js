import { socketAuthMiddleware } from './socketAuth.middleware.js';
import { presenceManager } from './presence.manager.js';
import { RoomManager } from './room.manager.js';
import { registerChatHandlers } from './chat.handler.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';

let ioInstance = null;

export const initSocketServer = (io) => {
  ioInstance = io;

  // 1. Handshake Authentication
  io.use(socketAuthMiddleware);

  // 2. Connection Handler
  io.on('connection', async (socket) => {
    const userId = socket.userId;
    const user = socket.user;

    // Join personal room for direct notifications
    socket.join(`user:${userId}`);

    // Fetch user's active workspaces to manage presence
    let activeWorkspaces = [];
    try {
      const memberships = await WorkspaceMember.find({
        userId,
        status: 'active',
      }).select('workspaceId');
      activeWorkspaces = memberships.map((m) => m.workspaceId.toString());
    } catch (e) {
      console.error('[Socket] Failed to fetch user workspaces for presence:', e.message);
    }

    // Register socket in presence manager
    const { isFirstConnection, activeTabsCount } = presenceManager.addUserSocket(
      userId,
      socket.id,
      activeWorkspaces
    );

    // If first connection across all tabs, broadcast presence:online to all active workspaces
    if (isFirstConnection) {
      activeWorkspaces.forEach((wId) => {
        io.to(`workspace:${wId}`).emit('presence:update', {
          userId,
          status: 'online',
        });
      });
    }

    // Send connection acknowledgment with user info and initial presence list
    socket.emit('socket:connected', {
      userId,
      name: user.name,
      activeTabsCount,
    });

    // Request online users for a workspace
    socket.on('presence:get_online', async ({ workspaceId }, callback) => {
      try {
        if (!workspaceId) return;
        const access = await RoomManager.validateRoomAccess(userId, `workspace:${workspaceId}`);
        if (!access.allowed) {
          if (typeof callback === 'function') callback({ error: access.error });
          return;
        }

        const onlineUserIds = presenceManager.getOnlineUsersForWorkspace(workspaceId);
        if (typeof callback === 'function') {
          callback({ success: true, onlineUserIds });
        } else {
          socket.emit('presence:online_list', { workspaceId, onlineUserIds });
        }
      } catch (err) {
        if (typeof callback === 'function') callback({ error: err.message });
      }
    });

    // 3. Room Management with Membership Validation
    socket.on('room:join', async ({ room }, callback) => {
      try {
        const access = await RoomManager.validateRoomAccess(userId, room);

        if (!access.allowed) {
          const res = { success: false, error: access.error, room };
          if (typeof callback === 'function') callback(res);
          return socket.emit('room:error', res);
        }

        socket.join(access.canonicalRoom);

        const res = { success: true, room: access.canonicalRoom };
        if (typeof callback === 'function') callback(res);
        socket.emit('room:joined', res);
      } catch (err) {
        const res = { success: false, error: err.message, room };
        if (typeof callback === 'function') callback(res);
        socket.emit('room:error', res);
      }
    });

    socket.on('room:leave', ({ room }, callback) => {
      if (room) {
        socket.leave(room);
        if (typeof callback === 'function') callback({ success: true, room });
      }
    });

    // 4. Register Chat Handlers
    registerChatHandlers(io, socket);

    // 5. Disconnect Handler
    socket.on('disconnect', () => {
      const result = presenceManager.removeUserSocket(socket.id);
      if (result && result.isLastConnection) {
        // User has closed all tabs - broadcast offline
        result.workspaces.forEach((wId) => {
          io.to(`workspace:${wId}`).emit('presence:update', {
            userId: result.userId,
            status: 'offline',
          });
        });
      }
    });
  });

  return io;
};

/**
 * Global Helper: Broadcast Task Real-Time Events
 */
export const broadcastTaskEvent = (eventType, { workspaceId, projectId, task }) => {
  if (!ioInstance) return;

  const payload = {
    eventType, // 'task:created' | 'task:moved' | 'task:updated' | 'task:deleted'
    workspaceId: workspaceId?.toString(),
    projectId: projectId?.toString(),
    task,
  };

  if (projectId) {
    ioInstance.to(`project:${projectId}`).emit(eventType, payload);
  }
  if (workspaceId) {
    ioInstance.to(`workspace:${workspaceId}`).emit(eventType, payload);
  }
};

/**
 * Global Helper: Send Real-Time Notification to User
 */
export const sendRealtimeNotification = (userId, notification) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${userId.toString()}`).emit('notification:new', notification);
};

export const getIO = () => ioInstance;
