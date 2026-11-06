import apiClient from './api.js';

export const analyticsService = {
  /**
   * Fetches real workspace analytics aggregated across tasks, projects, and members
   * @param {string} workspaceId
   * @param {string} timeframe - '7d' | '30d' | '90d' | 'all'
   */
  async getWorkspaceAnalytics(workspaceId, timeframe = '30d') {
    const res = await apiClient.get(`/v1/workspaces/${workspaceId}/analytics`, {
      params: { timeframe },
    });
    return res.data;
  },
};

export default analyticsService;
