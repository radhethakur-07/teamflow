import api from './api.js';

export const messageService = {
  getMessages: async (workspaceId, { channelId, recipientId, limit = 50, before } = {}) => {
    const params = {};
    if (channelId) params.channelId = channelId;
    if (recipientId) params.recipientId = recipientId;
    if (limit) params.limit = limit;
    if (before) params.before = before;

    const response = await api.get(`/workspaces/${workspaceId}/messages`, { params });
    return response.data.data;
  },

  sendMessage: async (workspaceId, { channelId, recipientId, content, clientTempId }) => {
    const response = await api.post(`/workspaces/${workspaceId}/messages`, {
      channelId,
      recipientId,
      content,
      clientTempId,
    });
    return response.data.data;
  },

  markRead: async (workspaceId, { messageIds, channelId, recipientId } = {}) => {
    const response = await api.post(`/workspaces/${workspaceId}/messages/read`, {
      messageIds,
      channelId,
      recipientId,
    });
    return response.data.data;
  },

  getUnreadCounts: async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}/messages/unread-counts`);
    return response.data.data;
  },
};

export default messageService;
