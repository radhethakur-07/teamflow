import axios from 'axios';

// Defensive Base API URL normalization: ensures whether input is root host, /api, or /api/v1,
// the resulting client baseURL is always formatted cleanly for /v1/... endpoints.
const rawApiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl.endsWith('/api/v1')
  ? rawApiUrl.slice(0, -3) // Normalize /api/v1 -> /api
  : rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : rawApiUrl === '' || rawApiUrl === '/api'
  ? '/api'
  : `${rawApiUrl}/api`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for HttpOnly refresh-token cookies
});

// Request Interceptor: Attach bearer tokens & active workspace context
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teamflow_access_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const activeWorkspaceId = localStorage.getItem('teamflow_active_workspace_id');
    if (activeWorkspaceId && !config.headers['x-workspace-id']) {
      config.headers['x-workspace-id'] = activeWorkspaceId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Concurrency-safe Token Refresh Queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Normalize responses and auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request has not already retried
    const isAuthError = error.response?.status === 401;
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh-token');
    const isLoginEndpoint = originalRequest?.url?.includes('/auth/login');

    if (isAuthError && originalRequest && !originalRequest._retry && !isRefreshEndpoint && !isLoginEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send refresh token request with HttpOnly cookie and fallback to stored refresh token
        const storedRefreshToken = localStorage.getItem('teamflow_refresh_token');
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/v1/auth/refresh-token`,
          storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
          { withCredentials: true }
        );

        const newAccessToken =
          refreshResponse.data?.data?.tokens?.accessToken ||
          refreshResponse.data?.tokens?.accessToken;
        const newRefreshToken =
          refreshResponse.data?.data?.tokens?.refreshToken ||
          refreshResponse.data?.tokens?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('teamflow_access_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('teamflow_refresh_token', newRefreshToken);
          }
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('No access token returned from refresh');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('teamflow_access_token');
        localStorage.removeItem('teamflow_refresh_token');
        return Promise.reject({
          message: 'Your session has expired. Please sign in again.',
          code: 'SESSION_EXPIRED',
          status: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    // Format standardized error payload with validation details unpack
    const details = error.response?.data?.error?.details;
    const detailMsg = Array.isArray(details) && details.length > 0
      ? details.map((d) => (d.field ? `${d.field}: ${d.issue}` : d.issue || d.message)).join('; ')
      : null;

    const baseMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Network request failed';

    const customError = {
      message: detailMsg && !baseMessage.includes(detailMsg)
        ? `${baseMessage} (${detailMsg})`
        : baseMessage,
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      status: error.response?.status || 0,
      details: error.response?.data?.error?.details || null,
      data: error.response?.data || null,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;
