import apiClient from './api.js';

export const teamService = {
  /**
   * Fetches all teams in a workspace
   */
  async getTeams(workspaceId) {
    const res = await apiClient.get(`/v1/workspaces/${workspaceId}/teams`);
    return res.data;
  },

  /**
   * Creates a new team squad
   */
  async createTeam(workspaceId, data) {
    const res = await apiClient.post(`/v1/workspaces/${workspaceId}/teams`, data);
    return res.data;
  },

  /**
   * Retrieves specific team details
   */
  async getTeamById(workspaceId, teamId) {
    const res = await apiClient.get(`/v1/workspaces/${workspaceId}/teams/${teamId}`);
    return res.data;
  },

  /**
   * Updates team details or members
   */
  async updateTeam(workspaceId, teamId, data) {
    const res = await apiClient.patch(
      `/v1/workspaces/${workspaceId}/teams/${teamId}`,
      data
    );
    return res.data;
  },

  /**
   * Deletes a team
   */
  async deleteTeam(workspaceId, teamId) {
    const res = await apiClient.delete(
      `/v1/workspaces/${workspaceId}/teams/${teamId}`
    );
    return res.data;
  },
};

export default teamService;
