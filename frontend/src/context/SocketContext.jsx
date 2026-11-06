import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io as ClientIO } from 'socket.io-client';
import { useSelector } from 'react-redux';
import messageService from '../services/messageService.js';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const reduxToken = useSelector((state) => state.auth?.accessToken);
  const user = useSelector((state) => state.auth?.user);
  const activeWorkspaceId = localStorage.getItem('teamflow_active_workspace_id');

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({
    directCounts: {},
    channelCounts: {},
    totalUnread: 0,
  });

  const joinedRoomsRef = useRef(new Set());
  const taskListenersRef = useRef(new Set());
  const messageListenersRef = useRef(new Set());
  const typingListenersRef = useRef(new Set());
  const receiptListenersRef = useRef(new Set());
  const notifListenersRef = useRef(new Set());

  // Resolve socket server base URL
  const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
      return import.meta.env.VITE_SOCKET_URL;
    }
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    return apiUrl.replace(/\/api(\/v1)?\/?$/, '');
  };

  // Hydrate unread message counts
  const refreshUnreadCounts = useCallback(async () => {
    if (!activeWorkspaceId) return;
    try {
      const counts = await messageService.getUnreadCounts(activeWorkspaceId);
      if (counts) {
        setUnreadCounts(counts);
      }
    } catch (err) {
      // Non-critical background count
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    refreshUnreadCounts();
  }, [refreshUnreadCounts]);

  // Connect Socket.IO
  useEffect(() => {
    const token = reduxToken || localStorage.getItem('teamflow_token');
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = getSocketUrl();
    const newSocket = ClientIO(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);

      // Re-join tracked rooms on reconnect
      joinedRoomsRef.current.forEach((room) => {
        newSocket.emit('room:join', { room });
      });

      // Request online users for current workspace
      if (activeWorkspaceId) {
        newSocket.emit('room:join', { room: `workspace:${activeWorkspaceId}` });
        newSocket.emit('presence:get_online', { workspaceId: activeWorkspaceId }, (res) => {
          if (res?.success && Array.isArray(res.onlineUserIds)) {
            setOnlineUsers(new Set(res.onlineUserIds));
          }
        });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Presence updates
    newSocket.on('presence:update', ({ userId, status }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === 'online') {
          next.add(userId.toString());
        } else {
          next.delete(userId.toString());
        }
        return next;
      });
    });

    // Real-Time Task events
    const handleTaskEvent = (eventType) => (payload) => {
      taskListenersRef.current.forEach((listener) => {
        try {
          listener(eventType, payload);
        } catch (e) {
          console.error('[Socket Task Listener Error]', e);
        }
      });
    };

    newSocket.on('task:created', handleTaskEvent('task:created'));
    newSocket.on('task:moved', handleTaskEvent('task:moved'));
    newSocket.on('task:updated', handleTaskEvent('task:updated'));
    newSocket.on('task:deleted', handleTaskEvent('task:deleted'));

    // Real-Time Chat message events
    newSocket.on('message:received', (data) => {
      messageListenersRef.current.forEach((listener) => {
        try {
          listener(data);
        } catch (e) {
          console.error('[Socket Message Listener Error]', e);
        }
      });
      refreshUnreadCounts();
    });

    // Typing update events
    newSocket.on('typing:update', (data) => {
      typingListenersRef.current.forEach((listener) => {
        try {
          listener(data);
        } catch (e) {
          console.error('[Socket Typing Listener Error]', e);
        }
      });
    });

    // Read receipt events
    newSocket.on('message:read_receipt', (data) => {
      receiptListenersRef.current.forEach((listener) => {
        try {
          listener(data);
        } catch (e) {
          console.error('[Socket Receipt Listener Error]', e);
        }
      });
      refreshUnreadCounts();
    });

    // Real-Time Notifications
    newSocket.on('notification:new', (notif) => {
      notifListenersRef.current.forEach((listener) => {
        try {
          listener(notif);
        } catch (e) {
          console.error('[Socket Notif Listener Error]', e);
        }
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [reduxToken, user, activeWorkspaceId, refreshUnreadCounts]);

  // Join Room with Access Verification
  const joinRoom = useCallback(
    (room, callback) => {
      if (!room) return;
      joinedRoomsRef.current.add(room);
      if (socket && isConnected) {
        socket.emit('room:join', { room }, (res) => {
          if (callback) callback(res);
        });
      }
    },
    [socket, isConnected]
  );

  // Leave Room
  const leaveRoom = useCallback(
    (room) => {
      if (!room) return;
      joinedRoomsRef.current.delete(room);
      if (socket && isConnected) {
        socket.emit('room:leave', { room });
      }
    },
    [socket, isConnected]
  );

  // Send Message
  const sendMessage = useCallback(
    ({ workspaceId, recipientId, channelId, content, clientTempId }, callback) => {
      if (socket && isConnected) {
        socket.emit(
          'message:send',
          {
            workspaceId,
            recipientId,
            channelId,
            content,
            clientTempId,
          },
          (res) => {
            if (callback) callback(res);
          }
        );
      } else {
        // Fallback to REST API if socket is temporarily offline
        messageService
          .sendMessage(workspaceId, {
            recipientId,
            channelId,
            content,
            clientTempId,
          })
          .then((msg) => {
            if (callback) callback({ success: true, message: msg });
          })
          .catch((err) => {
            if (callback) callback({ success: false, error: err.message });
          });
      }
    },
    [socket, isConnected]
  );

  // Send Typing Indicator
  const sendTyping = useCallback(
    (room, isTyping) => {
      if (!socket || !isConnected || !room) return;
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', { room });
    },
    [socket, isConnected]
  );

  // Mark Read
  const markMessagesRead = useCallback(
    (room, messageIds) => {
      if (!socket || !isConnected || !messageIds?.length) return;
      socket.emit('message:read', { room, messageIds });
    },
    [socket, isConnected]
  );

  // Event Subscription Helpers
  const onTaskEvent = useCallback((callback) => {
    taskListenersRef.current.add(callback);
    return () => taskListenersRef.current.delete(callback);
  }, []);

  const onMessageReceived = useCallback((callback) => {
    messageListenersRef.current.add(callback);
    return () => messageListenersRef.current.delete(callback);
  }, []);

  const onTypingUpdate = useCallback((callback) => {
    typingListenersRef.current.add(callback);
    return () => typingListenersRef.current.delete(callback);
  }, []);

  const onReadReceipt = useCallback((callback) => {
    receiptListenersRef.current.add(callback);
    return () => receiptListenersRef.current.delete(callback);
  }, []);

  const onNotification = useCallback((callback) => {
    notifListenersRef.current.add(callback);
    return () => notifListenersRef.current.delete(callback);
  }, []);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    isUserOnline: (userId) => (userId ? onlineUsers.has(userId.toString()) : false),
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    markMessagesRead,
    unreadCounts,
    refreshUnreadCounts,
    onTaskEvent,
    onMessageReceived,
    onTypingUpdate,
    onReadReceipt,
    onNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
