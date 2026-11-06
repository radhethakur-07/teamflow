import axios from 'axios';

// Base API URL from environment variable or proxy fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
        // Send refresh token request with HttpOnly cookie
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken =
          refreshResponse.data?.data?.tokens?.accessToken ||
          refreshResponse.data?.tokens?.accessToken;

        if (newAccessToken) {
          localStorage.setItem('teamflow_access_token', newAccessToken);
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
        return Promise.reject({
          message: 'Your session has expired. Please sign in again.',
          code: 'SESSION_EXPIRED',
          status: 401,
        });
      } finally {
        isRefreshing = false;
      }
    }

    // Format standardized error payload
    const customError = {
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Network request failed',
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      status: error.response?.status || 0,
      details: error.response?.data?.error?.details || null,
      data: error.response?.data || null,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;
