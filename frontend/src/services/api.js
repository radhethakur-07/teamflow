import axios from 'axios';

// Base API URL from environment variable or proxy fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach bearer tokens when present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('teamflow_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize responses and catch errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.error?.message || error.message || 'Network request failed',
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      status: error.response?.status || 0,
      details: error.response?.data?.error?.details || null,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
