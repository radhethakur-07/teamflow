import apiClient from './api.js';

export const taskService = {
  /**
   * Fetches tasks for a specific project
   */
  async getTasks(projectId, { column, priority, search } = {}, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.get(`/v1/projects/${projectId}/tasks`, {
      params: { column, priority, search },
      headers,
    });
    return res.data;
  },

  /**
   * Fetches tasks assigned to the current user across projects
   */
  async getMyTasks(workspaceId, { priority, search, column } = {}) {
    const res = await apiClient.get(`/v1/workspaces/${workspaceId}/tasks/my-tasks`, {
      params: { priority, search, column },
    });
    return res.data;
  },

  /**
   * Fetches all workspace tasks (for calendar, lists, or global search)
   */
  async getAllWorkspaceTasks(workspaceId, params = {}) {
    const res = await apiClient.get(`/v1/workspaces/${workspaceId}/tasks/all`, {
      params,
    });
    return res.data;
  },

  /**
   * Creates a new task in a project
   */
  async createTask(projectId, data, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.post(`/v1/projects/${projectId}/tasks`, data, {
      headers,
    });
    return res.data;
  },

  /**
   * Retrieves single task by ID
   */
  async getTaskById(taskId, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.get(`/v1/tasks/${taskId}`, { headers });
    return res.data;
  },

  /**
   * Updates task details
   */
  async updateTask(taskId, data, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.patch(`/v1/tasks/${taskId}`, data, { headers });
    return res.data;
  },

  /**
   * Moves task to a different Kanban column with new order index
   */
  async moveTask(taskId, { column, orderIndex }, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.patch(
      `/v1/tasks/${taskId}/move`,
      { column, orderIndex },
      { headers }
    );
    return res.data;
  },

  /**
   * Deletes (archives) a task
   */
  async deleteTask(taskId, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.delete(`/v1/tasks/${taskId}`, { headers });
    return res.data;
  },

  /**
   * Adds a subtask checklist item
   */
  async addChecklistItem(taskId, title, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.post(
      `/v1/tasks/${taskId}/checklist`,
      { title },
      { headers }
    );
    return res.data;
  },

  /**
   * Toggles completion status of a checklist item
   */
  async toggleChecklistItem(taskId, itemId, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.patch(
      `/v1/tasks/${taskId}/checklist/${itemId}`,
      {},
      { headers }
    );
    return res.data;
  },

  /**
   * Deletes a checklist item
   */
  async deleteChecklistItem(taskId, itemId, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.delete(`/v1/tasks/${taskId}/checklist/${itemId}`, {
      headers,
    });
    return res.data;
  },

  /**
   * Fetches comments for a task
   */
  async getComments(taskId, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.get(`/v1/tasks/${taskId}/comments`, { headers });
    return res.data;
  },

  /**
   * Posts a comment on a task
   */
  async addComment(taskId, content, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.post(
      `/v1/tasks/${taskId}/comments`,
      { content },
      { headers }
    );
    return res.data;
  },

  /**
   * Deletes a comment
   */
  async deleteComment(taskId, commentId, workspaceId = null) {
    const headers = workspaceId ? { 'x-workspace-id': workspaceId } : {};
    const res = await apiClient.delete(`/v1/tasks/${taskId}/comments/${commentId}`, {
      headers,
    });
    return res.data;
  },
};

export default taskService;
