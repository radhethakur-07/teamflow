import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCredentials,
  setUser,
  setWorkspaces,
  setCurrentWorkspace,
  logout as logoutAction,
  setAuthLoading,
  setAuthError,
  clearAuthError,
  setOtpChallenge,
  clearOtpChallenge,
} from '../store/slices/authSlice.js';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [initChecked, setInitChecked] = useState(false);

  // Initialize and check persistent session on application boot
  const checkAuth = useCallback(async () => {
    const hasToken =
      Boolean(localStorage.getItem('teamflow_access_token')) ||
      Boolean(localStorage.getItem('teamflow_refresh_token'));

    if (!hasToken) {
      dispatch(logoutAction());
      dispatch(setAuthLoading(false));
      setInitChecked(true);
      return;
    }

    try {
      dispatch(setAuthLoading(true));
      const profileData = await authService.getMe();
      if (profileData && profileData.user) {
        dispatch(
          setCredentials({
            user: profileData.user,
            workspaces: profileData.workspaces,
          })
        );
      }
    } catch (err) {
      // If initial getMe failed (e.g. 15m access token expired), attempt silent refresh
      try {
        const storedRefreshToken = localStorage.getItem('teamflow_refresh_token');
        const refreshRes = await authService.refreshToken(storedRefreshToken);
        if (refreshRes?.tokens?.accessToken) {
          const profileData = await authService.getMe();
          dispatch(
            setCredentials({
              user: profileData.user,
              token: refreshRes.tokens.accessToken,
              refreshToken: refreshRes.tokens.refreshToken || storedRefreshToken,
              workspaces: profileData.workspaces,
            })
          );
        } else {
          dispatch(logoutAction());
        }
      } catch (refreshErr) {
        dispatch(logoutAction());
      }
    } finally {
      dispatch(setAuthLoading(false));
      setInitChecked(true);
    }
  }, [dispatch]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async ({ email, password, otp }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());

      const result = await authService.login({ email, password, otp });

      if (result.requireOtp) {
        dispatch(setOtpChallenge({ mode: 'login', email, devOtp: result.devOtp }));
        dispatch(setAuthLoading(false));
        return { requireOtp: true, ...result };
      }

      dispatch(
        setCredentials({
          user: result.user,
          token: result.tokens?.accessToken,
          refreshToken: result.tokens?.refreshToken,
          workspaces: result.workspaces,
        })
      );

      if (result.defaultWorkspace) {
        dispatch(setCurrentWorkspace(result.defaultWorkspace));
      }

      // Rehydrate workspace list in background
      try {
        const profile = await authService.getMe();
        if (profile?.workspaces) {
          dispatch(setWorkspaces(profile.workspaces));
        }
      } catch (e) {
        // Non-blocking
      }

      return { success: true, user: result.user };
    } catch (err) {
      dispatch(setAuthError(err.message));
      throw err;
    }
  };

  const verifyLoginOtp = async ({ email, otp }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());

      const result = await authService.verifyLoginOtp({ email, otp });

      dispatch(
        setCredentials({
          user: result.user,
          token: result.tokens?.accessToken,
          refreshToken: result.tokens?.refreshToken,
          workspaces: result.workspaces,
        })
      );

      if (result.defaultWorkspace) {
        dispatch(setCurrentWorkspace(result.defaultWorkspace));
      }

      try {
        const profile = await authService.getMe();
        if (profile?.workspaces) {
          dispatch(setWorkspaces(profile.workspaces));
        }
      } catch (e) {}

      return { success: true, user: result.user };
    } catch (err) {
      dispatch(setAuthError(err.message));
      throw err;
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(clearAuthError());

      const result = await authService.register({ name, email, password });

      dispatch(
        setCredentials({
          user: result.user,
          token: result.tokens?.accessToken,
          refreshToken: result.tokens?.refreshToken,
          defaultWorkspace: result.defaultWorkspace,
        })
      );

      return result;
    } catch (err) {
      dispatch(setAuthError(err.message));
      throw err;
    }
  };

  const verifyEmail = async ({ email, otp }) => {
    try {
      const result = await authService.verifyEmail({ email, otp });
      if (authState.user && authState.user.email === email) {
        dispatch(setUser({ ...authState.user, isEmailVerified: true }));
      }
      return result;
    } catch (err) {
      throw err;
    }
  };

  const resendVerification = async ({ email }) => {
    return authService.resendVerification({ email });
  };

  const forgotPassword = async ({ email }) => {
    return authService.forgotPassword({ email });
  };

  const resetPassword = async ({ email, otp, newPassword }) => {
    return authService.resetPassword({ email, otp, newPassword });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      dispatch(logoutAction());
    }
  };

  const switchWorkspace = (workspace) => {
    dispatch(setCurrentWorkspace(workspace));
  };

  const value = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: !initChecked || authState.isLoading,
    error: authState.error,
    workspaces: authState.workspaces,
    currentWorkspace: authState.currentWorkspace,
    otpChallenge: authState.otpChallenge,
    login,
    verifyLoginOtp,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    switchWorkspace,
    clearOtpChallenge: () => dispatch(clearOtpChallenge()),
    clearError: () => dispatch(clearAuthError()),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
