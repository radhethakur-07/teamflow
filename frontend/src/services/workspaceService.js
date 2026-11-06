import apiClient from './api.js';

export const workspaceService = {
  /**
   * Fetches all active workspaces for the current user
   */
  async getWorkspaces() {
    const res = await apiClient.get('/v1/workspaces');
    return res.data;
  },

  /**
   * Creates a new workspace
   */
  async createWorkspace({ name, description, slug }) {
    const res = await apiClient.post('/v1/workspaces', { name, description, slug });
    return res.data;
  },

  /**
   * Retrieves specific workspace details
   */
  async getWorkspaceById(workspaceId) {
    const res = await apiClient.get(`/v1/workspaces/${workspaceId}`);
    return res.data;
  },

  /**
   * Updates workspace details
   */
  async updateWorkspace(workspaceId, data) {
    const res = await apiClient.patch(`/v1/workspaces/${workspaceId}`, data);
    return res.data;
  },

  /**
   * Retrieves all members of a workspace
   */
  async getMembers(workspaceId) {
    const res = await apiClient.get(`/v1/workspaces/${workspaceId}/members`);
    return res.data;
  },

  /**
   * Issues an email invitation
   */
  async inviteMember(workspaceId, { email, role = 'team_member' }) {
    const res = await apiClient.post(`/v1/workspaces/${workspaceId}/invitations`, {
      email,
      role,
    });
    return res.data;
  },

  /**
   * Accepts a pending invitation
   */
  async acceptInvitation(token) {
    const res = await apiClient.post(`/v1/workspaces/invitations/${token}/accept`);
    return res.data;
  },

  /**
   * Updates member role
   */
  async updateMemberRole(workspaceId, memberId, role) {
    const res = await apiClient.patch(
      `/v1/workspaces/${workspaceId}/members/${memberId}`,
      { role }
    );
    return res.data;
  },

  /**
   * Removes member from workspace
   */
  async removeMember(workspaceId, memberId) {
    const res = await apiClient.delete(
      `/v1/workspaces/${workspaceId}/members/${memberId}`
    );
    return res.data;
  },

  /**
   * Retrieves workspace activity logs
   */
  async getActivities(workspaceId, limit = 50) {
    const res = await apiClient.get(`/v1/workspaces/${workspaceId}/activities`, {
      params: { limit },
    });
    return res.data;
  },
};

export default workspaceService;
