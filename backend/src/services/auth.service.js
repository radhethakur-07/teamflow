import crypto from 'crypto';
import { User } from '../models/User.js';
import { Workspace } from '../models/Workspace.js';
import { WorkspaceMember } from '../models/WorkspaceMember.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.js';

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    passwordHash,
  });

  // Auto-provision initial personal workspace for new users
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30) || 'workspace';
  const uniqueSlug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

  const workspace = await Workspace.create({
    name: `${name}'s Workspace`,
    slug: uniqueSlug,
    ownerId: user._id,
    plan: 'starter',
  });

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: user._id,
    role: 'workspace_owner',
    status: 'active',
  });

  user.defaultWorkspaceId = workspace._id;
  await user.save();

  const tokens = generateTokens(user);

  return {
    user: user.toSafeJSON(),
    defaultWorkspace: workspace,
    tokens,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  if (user.status !== 'active') {
    const error = new Error('Account is suspended or deactivated.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_INACTIVE';
    throw error;
  }

  const tokens = generateTokens(user);

  return {
    user: user.toSafeJSON(),
    tokens,
  };
};

export const refreshTokens = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload || !payload.userId) {
    const error = new Error('Invalid or expired refresh token.');
    error.statusCode = 401;
    error.code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }

  const user = await User.findById(payload.userId);
  if (!user || user.status !== 'active') {
    const error = new Error('User not found or inactive.');
    error.statusCode = 401;
    error.code = 'USER_NOT_ACTIVE';
    throw error;
  }

  const tokens = generateTokens(user);
  return { tokens };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const memberships = await WorkspaceMember.find({ userId, status: 'active' })
    .populate('workspaceId', 'name slug logoUrl plan')
    .lean();

  return {
    user: user.toSafeJSON(),
    workspaces: memberships.map((m) => ({
      workspace: m.workspaceId,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  };
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const isMatch = await comparePassword(currentPassword, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Current password is incorrect.');
    error.statusCode = 400;
    error.code = 'INVALID_CURRENT_PASSWORD';
    throw error;
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return { success: true };
};
