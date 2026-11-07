import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import { getRefreshTokenCookieOptions } from '../utils/jwt.js';
import * as authService from '../services/auth.service.js';

const REFRESH_COOKIE_NAME = 'teamflow_refresh_token';

/**
 * Sets secure HttpOnly cookie for refresh token
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  if (refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshTokenCookieOptions());
  }
};

/**
 * Clears secure HttpOnly refresh token cookie
 */
const clearRefreshTokenCookie = (res) => {
  const options = getRefreshTokenCookieOptions();
  delete options.maxAge;
  res.clearCookie(REFRESH_COOKIE_NAME, options);
};

export const register = asyncHandler(async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';

  const result = await authService.registerUser({
    ...req.body,
    userAgent,
    ipAddress,
  });

  // Set refresh token in HttpOnly cookie
  if (result.tokens?.refreshToken) {
    setRefreshTokenCookie(res, result.tokens.refreshToken);
  }

  const responseData = {
    user: result.user,
    defaultWorkspace: result.defaultWorkspace,
    tokens: {
      accessToken: result.tokens.accessToken,
    },
    emailVerificationRequired: result.emailVerificationRequired,
  };

  return sendCreated(res, responseData, 'User registration successful');
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyEmail({ email, otp });
  return sendSuccess(res, result, 'Email verified successfully');
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendVerification({ email });
  return sendSuccess(res, result, 'Verification code sent');
});

export const login = asyncHandler(async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';

  const result = await authService.loginUser({
    ...req.body,
    userAgent,
    ipAddress,
  });

  if (result.requireOtp) {
    return sendSuccess(res, result, 'Verification code required');
  }

  // Set rotated refresh token in HttpOnly cookie
  if (result.tokens?.refreshToken) {
    setRefreshTokenCookie(res, result.tokens.refreshToken);
  }

  const responseData = {
    user: result.user,
    workspaces: result.workspaces,
    defaultWorkspace: result.defaultWorkspace,
    tokens: {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    },
  };

  return sendSuccess(res, responseData, 'Authentication successful');
});

export const verifyLoginOtp = asyncHandler(async (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';

  const result = await authService.verifyLoginOtp({
    ...req.body,
    userAgent,
    ipAddress,
  });

  if (result.tokens?.refreshToken) {
    setRefreshTokenCookie(res, result.tokens.refreshToken);
  }

  const responseData = {
    user: result.user,
    workspaces: result.workspaces,
    defaultWorkspace: result.defaultWorkspace,
    tokens: {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    },
  };

  return sendSuccess(res, responseData, 'Verification successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  // Extract refresh token from signed/unsigned HttpOnly cookie, or body fallback
  const token =
    req.cookies?.[REFRESH_COOKIE_NAME] ||
    req.signedCookies?.[REFRESH_COOKIE_NAME] ||
    req.body?.refreshToken;

  const userAgent = req.headers['user-agent'] || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';

  const result = await authService.refreshTokens(token, userAgent, ipAddress);

  // Set newly rotated refresh token in HttpOnly cookie
  if (result.tokens?.refreshToken) {
    setRefreshTokenCookie(res, result.tokens.refreshToken);
  }

  return sendSuccess(
    res,
    {
      tokens: {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
    },
    'Token refreshed successfully'
  );
});

export const logout = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.[REFRESH_COOKIE_NAME] ||
    req.signedCookies?.[REFRESH_COOKIE_NAME] ||
    req.body?.refreshToken;

  await authService.logoutUser(token);
  clearRefreshTokenCookie(res);

  return sendSuccess(res, { success: true }, 'Successfully logged out');
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAllSessions(req.user._id);
  clearRefreshTokenCookie(res);

  return sendSuccess(res, { success: true }, 'All sessions have been revoked');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword({ email });
  return sendSuccess(res, result, result.message);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const result = await authService.resetPassword({ email, otp, newPassword });
  clearRefreshTokenCookie(res);
  return sendSuccess(res, result, result.message);
});

export const getMe = asyncHandler(async (req, res) => {
  const profile = await authService.getUserProfile(req.user._id);
  return sendSuccess(res, profile, 'Profile retrieved successfully');
});

export const updateMe = asyncHandler(async (req, res) => {
  const result = await authService.updateUserProfile(req.user._id, req.body);
  return sendSuccess(res, result, 'Profile updated successfully');
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.updatePassword(req.user._id, currentPassword, newPassword);
  return sendSuccess(res, { success: true }, 'Password changed successfully');
});
