import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return sendCreated(res, result, 'User registration successful');
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return sendSuccess(res, result, 'Authentication successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshTokens(refreshToken);
  return sendSuccess(res, result, 'Token refreshed successfully');
});

export const getMe = asyncHandler(async (req, res) => {
  const profile = await authService.getUserProfile(req.user._id);
  return sendSuccess(res, profile, 'Profile retrieved successfully');
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.updatePassword(req.user._id, currentPassword, newPassword);
  return sendSuccess(res, { success: true }, 'Password changed successfully');
});
