import apiClient from './api.js';

export const healthService = {
  /**
   * Fetches the backend system health status
   * Endpoint: GET /api/health
   */
  async checkHealth() {
    const startTime = performance.now();
    const result = await apiClient.get('/health');
    const endTime = performance.now();
    const roundTripMs = Math.round(endTime - startTime);

    return {
      ...result,
      latencyMs: roundTripMs,
    };
  },
};
