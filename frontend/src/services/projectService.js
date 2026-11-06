import apiClient from './api.js';

export const projectService = {
  /**
   * Fetches projects for a workspace with optional status filter & search
   */
  async getProjects(workspaceId, { status = 'active', search = '', page = 1, limit = 50 } = {}) {
    const res = await apiClient.get(`/v1/workspaces/${workspaceId}/projects`, {
      params: { status, search, page, limit },
    });
    return res.data;
  },

  /**
   * Creates a new project in the workspace
   */
  async createProject(workspaceId, data) {
    const res = await apiClient.post(`/v1/workspaces/${workspaceId}/projects`, data);
    return res.data;
  },

  /**
   * Retrieves single project details with task throughput counts
   */
  async getProjectById(projectId, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.get(`/v1/projects/${projectId}`, { headers });
    return res.data;
  },

  /**
   * Updates project details, status, or member list
   */
  async updateProject(projectId, data, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.patch(`/v1/projects/${projectId}`, data, { headers });
    return res.data;
  },

  /**
   * Deletes a project
   */
  async deleteProject(projectId, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.delete(`/v1/projects/${projectId}`, { headers });
    return res.data;
  },

  /**
   * Fetches audit activity log events for a project
   */
  async getProjectActivities(projectId, workspaceId = null, limit = 30) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.get(`/v1/projects/${projectId}/activities`, {
      params: { limit },
      headers,
    });
    return res.data;
  },
};

export default projectService;
