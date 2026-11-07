import { createSlice } from '@reduxjs/toolkit';

const initialToken = localStorage.getItem('teamflow_access_token') || null;

const initialState = {
  user: null,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  isLoading: true, // Checking initial session state
  error: null,
  workspaces: [],
  currentWorkspace: null,
  pendingEmail: null,
  otpChallenge: null, // { mode: 'login' | 'verify_email', email: string }
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setCredentials: (state, action) => {
      const { user, token, refreshToken, workspaces, defaultWorkspace } = action.payload;
      state.user = user;
      state.token = token || state.token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.otpChallenge = null;
      state.pendingEmail = null;

      if (workspaces && workspaces.length > 0) {
        state.workspaces = workspaces;
        state.currentWorkspace = workspaces[0].workspace || workspaces[0];
      } else if (defaultWorkspace) {
        state.workspaces = [{ workspace: defaultWorkspace, role: 'workspace_owner' }];
        state.currentWorkspace = defaultWorkspace;
      }

      if (token) {
        localStorage.setItem('teamflow_access_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('teamflow_refresh_token', refreshToken);
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
      if (!state.currentWorkspace && action.payload.length > 0) {
        state.currentWorkspace = action.payload[0].workspace || action.payload[0];
      }
    },
    setCurrentWorkspace: (state, action) => {
      state.currentWorkspace = action.payload;
    },
    setOtpChallenge: (state, action) => {
      state.otpChallenge = action.payload; // { mode, email }
      state.isLoading = false;
    },
    clearOtpChallenge: (state) => {
      state.otpChallenge = null;
      state.pendingEmail = null;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.workspaces = [];
      state.currentWorkspace = null;
      state.otpChallenge = null;
      state.pendingEmail = null;
      localStorage.removeItem('teamflow_access_token');
      localStorage.removeItem('teamflow_refresh_token');
      localStorage.removeItem('teamflow_active_workspace_id');
    },
  },
});

export const {
  setAuthLoading,
  setCredentials,
  setUser,
  setWorkspaces,
  setCurrentWorkspace,
  setOtpChallenge,
  clearOtpChallenge,
  setAuthError,
  clearAuthError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
