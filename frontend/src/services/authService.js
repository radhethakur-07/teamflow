import apiClient from './api.js';

export const authService = {
  /**
   * Authenticates user credentials or initiates OTP challenge
   */
  async login({ email, password, otp }) {
    const res = await apiClient.post('/v1/auth/login', {
      email,
      password,
      ...(otp ? { otp } : {}),
    });
    return res.data;
  },

  /**
   * Verifies 6-digit login OTP
   */
  async verifyLoginOtp({ email, otp }) {
    const res = await apiClient.post('/v1/auth/login/otp', { email, otp });
    return res.data;
  },

  /**
   * Registers a new user and creates their personal workspace
   */
  async register({ name, email, password }) {
    const res = await apiClient.post('/v1/auth/register', {
      name,
      email,
      password,
    });
    return res.data;
  },

  /**
   * Confirms email address using the 6-digit verification code
   */
  async verifyEmail({ email, otp }) {
    const res = await apiClient.post('/v1/auth/verify-email', { email, otp });
    return res.data;
  },

  /**
   * Resends verification code to user email
   */
  async resendVerification({ email }) {
    const res = await apiClient.post('/v1/auth/resend-verification', { email });
    return res.data;
  },

  /**
   * Explicitly triggers token refresh using HttpOnly cookie or stored refresh token
   */
  async refreshToken(refreshTokenOverride = null) {
    const stored = refreshTokenOverride || localStorage.getItem('teamflow_refresh_token');
    const res = await apiClient.post('/v1/auth/refresh-token', stored ? { refreshToken: stored } : {});
    return res.data;
  },

  /**
   * Dispatches password recovery email with 6-digit OTP
   */
  async forgotPassword({ email }) {
    const res = await apiClient.post('/v1/auth/forgot-password', { email });
    return res.data;
  },

  /**
   * Resets user password using single-use OTP
   */
  async resetPassword({ email, otp, newPassword }) {
    const res = await apiClient.post('/v1/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return res.data;
  },

  /**
   * Fetches the current user profile and workspace memberships
   */
  async getMe() {
    const res = await apiClient.get('/v1/auth/me');
    return res.data;
  },

  /**
   * Updates user profile fields
   */
  async updateMe(data) {
    const res = await apiClient.put('/v1/auth/me', data);
    return res.data;
  },

  /**
   * Changes user password
   */
  async updatePassword({ currentPassword, newPassword }) {
    const res = await apiClient.put('/v1/auth/password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  /**
   * Logs out current session and revokes refresh token
   */
  async logout() {
    try {
      const stored = localStorage.getItem('teamflow_refresh_token');
      await apiClient.post('/v1/auth/logout', stored ? { refreshToken: stored } : {});
    } finally {
      localStorage.removeItem('teamflow_access_token');
      localStorage.removeItem('teamflow_refresh_token');
      localStorage.removeItem('teamflow_active_workspace_id');
    }
  },

  /**
   * Revokes all sessions across all devices
   */
  async logoutAll() {
    try {
      await apiClient.post('/v1/auth/logout-all');
    } finally {
      localStorage.removeItem('teamflow_access_token');
      localStorage.removeItem('teamflow_refresh_token');
      localStorage.removeItem('teamflow_active_workspace_id');
    }
  },
};

export default authService;
