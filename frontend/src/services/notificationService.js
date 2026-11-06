import api from './api.js';

export const notificationService = {
  getMyNotifications: async ({ unreadOnly = false, limit = 50, page = 1 } = {}) => {
    const response = await api.get('/notifications', {
      params: { unreadOnly, limit, page },
    });
    return response.data;
  },

  markNotificationRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllRead: async () => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data.data;
  },
};

export default notificationService;
